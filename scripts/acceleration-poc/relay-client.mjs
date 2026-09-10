import { createSocket } from "node:dgram";
import { isIP } from "node:net";
import { decodeFrame, encodeFrame, FrameType, jsonPayload, randomSessionId, parseEndpoint, verifyFrame } from "./protocol.mjs";

export async function createRelayClient({
  relayHost,
  relayPort,
  targetHost,
  targetPort,
  token,
  localHost = "127.0.0.1",
  localPort = 0,
  timeoutMs = 5_000,
} = {}) {
  if (!relayHost || !Number.isInteger(relayPort)) throw new Error("Relay endpoint is required");
  if (!targetHost || !Number.isInteger(targetPort)) throw new Error("Target endpoint is required");
  const relayFamily = isIP(relayHost) === 6 ? "udp6" : "udp4";
  const localFamily = isIP(localHost) === 6 ? "udp6" : "udp4";
  const relaySocket = createSocket(relayFamily);
  const localSocket = createSocket(localFamily);
  const sessionId = randomSessionId();
  let sequence = 1;
  let peer = null;
  let ready = false;
  let closed = false;
  let resolveReady;
  let rejectReady;
  const readyPromise = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });

  function sendFrame(type, payload = Buffer.alloc(0)) {
    const packet = encodeFrame(type, sessionId, sequence++, payload, token);
    relaySocket.send(packet, relayPort, relayHost);
  }

  function closeSockets() {
    if (closed) return;
    closed = true;
    try { relaySocket.close(); } catch {}
    try { localSocket.close(); } catch {}
  }

  relaySocket.on("message", (packet) => {
    const frame = decodeFrame(packet);
    if (!frame || frame.sessionId !== sessionId || !verifyFrame(frame, token)) return;
    if (frame.type === FrameType.OPEN_OK) {
      ready = true;
      resolveReady();
    } else if (frame.type === FrameType.OPEN_ERR) {
      const detail = (() => { try { return JSON.parse(frame.payload.toString("utf8")); } catch { return {}; } })();
      rejectReady(new Error(detail.code ?? "ACCELERATION_OPEN_FAILED"));
      closeSockets();
    } else if (frame.type === FrameType.DATA && peer) {
      localSocket.send(frame.payload, peer.port, peer.address);
    } else if (frame.type === FrameType.CLOSE) {
      closeSockets();
    }
  });

  const onSocketError = (error) => {
    if (!ready) rejectReady(error);
    closeSockets();
  };
  relaySocket.once("error", onSocketError);
  localSocket.once("error", onSocketError);

  await Promise.all([
    new Promise((resolve) => relaySocket.bind(0, relayFamily === "udp6" ? "::" : "0.0.0.0", resolve)),
    new Promise((resolve) => localSocket.bind(localPort, localHost, resolve)),
  ]);

  localSocket.on("message", (payload, rinfo) => {
    if (closed) return;
    peer = { address: rinfo.address, port: rinfo.port };
    if (ready) sendFrame(FrameType.DATA, payload);
  });

  const timer = setTimeout(() => {
    rejectReady(new Error("ACCELERATION_OPEN_TIMEOUT"));
    closeSockets();
  }, timeoutMs);
  sendFrame(FrameType.OPEN, jsonPayload({ targetHost, targetPort }));
  try {
    await readyPromise;
  } finally {
    clearTimeout(timer);
  }

  const localAddress = localSocket.address();
  return {
    sessionId,
    localHost,
    localPort: typeof localAddress === "object" ? localAddress.port : localPort,
    waitReady: () => readyPromise,
    close() {
      if (closed) return;
      if (ready) {
        try { sendFrame(FrameType.CLOSE); } catch {}
      }
      closeSockets();
    },
  };
}

export function parseRelayEndpoint(value) {
  return parseEndpoint(value, 39087);
}
