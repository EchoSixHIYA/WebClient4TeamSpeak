import { createSocket } from "node:dgram";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { decodeFrame, encodeFrame, FrameType, jsonPayload, parseJsonPayload, verifyFrame } from "./protocol.mjs";

function endpointKey(address, port) {
  return `${address}/${port}`;
}

function isPrivateAddress(host) {
  const family = isIP(host);
  if (family === 4) {
    const octets = host.split(".").map(Number);
    return octets[0] === 10
      || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
      || octets[0] === 192 && octets[1] === 168
      || octets[0] === 127
      || octets[0] === 169 && octets[1] === 254
      || octets[0] === 0;
  }
  if (family === 6) {
    const normalized = host.toLowerCase();
    return normalized === "::1"
      || normalized === "::"
      || normalized.startsWith("fc")
      || normalized.startsWith("fd")
      || normalized.startsWith("fe8")
      || normalized.startsWith("fe9")
      || normalized.startsWith("fea")
      || normalized.startsWith("feb");
  }
  return host === "localhost" || host.endsWith(".localhost");
}

async function resolveTarget(host) {
  const family = isIP(host);
  if (family) return { host, family };
  const records = await lookup(host, { all: true, verbatim: true });
  const record = records.find((item) => item.family === 4) ?? records[0];
  if (!record) throw new Error("TARGET_DNS_EMPTY");
  return { host: record.address, family: record.family };
}

export async function createRelayServer({
  host = "127.0.0.1",
  port = 0,
  token,
  allowPrivate = false,
  idleTimeoutMs = 30_000,
} = {}) {
  const serverFamily = isIP(host) === 6 ? "udp6" : "udp4";
  const socket = createSocket(serverFamily);
  const sessions = new Map();
  let closed = false;

  function sendToClient(session, type, payload = Buffer.alloc(0)) {
    if (closed) return;
    const packet = encodeFrame(type, session.id, session.outSequence++, payload, token);
    socket.send(packet, session.client.port, session.client.address);
  }

  function cleanup(session) {
    if (!session || session.closed) return;
    session.closed = true;
    sessions.delete(session.id);
    session.targetSocket?.close();
  }

  async function openSession(frame, client) {
    const request = parseJsonPayload(frame.payload);
    if (!request || typeof request.targetHost !== "string" || !Number.isInteger(request.targetPort)) {
      return;
    }
    if (!allowPrivate && (isPrivateAddress(request.targetHost) || request.targetHost === "localhost")) {
      const error = { code: "PRIVATE_TARGET_BLOCKED" };
      socket.send(encodeFrame(FrameType.OPEN_ERR, frame.sessionId, 0, jsonPayload(error), token), client.port, client.address);
      return;
    }

    const existing = sessions.get(frame.sessionId);
    if (existing) cleanup(existing);
    const session = {
      id: frame.sessionId,
      client,
      clientKey: endpointKey(client.address, client.port),
      outSequence: 1,
      lastActivity: Date.now(),
      targetSocket: null,
      closed: false,
    };
    sessions.set(session.id, session);

    try {
      const target = await resolveTarget(request.targetHost);
      const targetSocket = createSocket(target.family === 6 ? "udp6" : "udp4");
      session.targetSocket = targetSocket;
      targetSocket.on("message", (payload) => {
        session.lastActivity = Date.now();
        sendToClient(session, FrameType.DATA, payload);
      });
      targetSocket.on("error", (error) => {
        if (!session.closed) sendToClient(session, FrameType.OPEN_ERR, jsonPayload({ code: "TARGET_SOCKET_ERROR", message: error.message }));
        cleanup(session);
      });
      targetSocket.connect(request.targetPort, target.host, () => {
        session.lastActivity = Date.now();
        sendToClient(session, FrameType.OPEN_OK, jsonPayload({ targetHost: target.host, targetPort: request.targetPort }));
      });
    } catch (error) {
      cleanup(session);
      socket.send(encodeFrame(FrameType.OPEN_ERR, frame.sessionId, 0, jsonPayload({ code: "TARGET_OPEN_FAILED", message: error.message }), token), client.port, client.address);
    }
  }

  socket.on("message", (packet, rinfo) => {
    const frame = decodeFrame(packet);
    if (!frame || !verifyFrame(frame, token)) return;
    const client = { address: rinfo.address, port: rinfo.port };
    if (frame.type === FrameType.OPEN) {
      void openSession(frame, client);
      return;
    }

    const session = sessions.get(frame.sessionId);
    if (!session || session.clientKey !== endpointKey(rinfo.address, rinfo.port)) return;
    session.lastActivity = Date.now();
    if (frame.type === FrameType.DATA && session.targetSocket) {
      session.targetSocket.send(frame.payload);
    } else if (frame.type === FrameType.CLOSE) {
      sendToClient(session, FrameType.CLOSE);
      cleanup(session);
    } else if (frame.type === FrameType.PING) {
      sendToClient(session, FrameType.PONG);
    }
  });

  socket.on("error", (error) => {
    for (const session of sessions.values()) cleanup(session);
    if (!closed) throw error;
  });

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const session of sessions.values()) {
      if (now - session.lastActivity > idleTimeoutMs) cleanup(session);
    }
  }, Math.max(1000, Math.min(idleTimeoutMs, 5000)));
  sweep.unref();

  await new Promise((resolve, reject) => {
    const onError = (error) => { socket.off("listening", onListening); reject(error); };
    const onListening = () => { socket.off("error", onError); resolve(); };
    socket.once("error", onError);
    socket.once("listening", onListening);
    socket.bind({ address: host, port });
  });

  const address = socket.address();
  return {
    host,
    port: typeof address === "object" ? address.port : port,
    family: serverFamily,
    close() {
      if (closed) return;
      closed = true;
      clearInterval(sweep);
      for (const session of sessions.values()) cleanup(session);
      socket.close();
    },
  };
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll("\\", "/")}`) {
  const token = process.env.WEBSPEAK_ACCEL_TOKEN;
  if (!token) throw new Error("Set WEBSPEAK_ACCEL_TOKEN before starting the PoC relay");
  const host = process.env.WEBSPEAK_ACCEL_HOST ?? "0.0.0.0";
  const port = Number(process.env.WEBSPEAK_ACCEL_PORT ?? 39087);
  const server = await createRelayServer({ host, port, token });
  console.log(`ACCELERATION_RELAY_LISTEN ${server.host}:${server.port}`);
}
