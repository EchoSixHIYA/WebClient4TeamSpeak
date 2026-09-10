import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createSocket } from "node:dgram";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const MAGIC = Buffer.from("WSAT");
const VERSION = 1;
const HEADER_SIZE = 34;
const MAX_PAYLOAD_SIZE = 60_000;
export const DEFAULT_ACCELERATION_RELAY_PORT = 39087;

const enum FrameType {
  OPEN = 1,
  OPEN_OK = 2,
  OPEN_ERR = 3,
  DATA = 4,
  CLOSE = 5,
  PING = 6,
  PONG = 7,
}

export interface AccelerationRelayOptions {
  relayHost: string;
  relayPort: number;
  token: string;
  timeoutMs?: number;
}

export interface ConfiguredAccelerationRelay extends AccelerationRelayOptions {
  id: string;
  name: string;
}

export interface AccelerationTarget {
  host: string;
  port: number;
}

export interface AccelerationRelayClient {
  readonly localHost: string;
  readonly localPort: number;
  readonly sessionId: number;
  close(): void;
}

interface Frame {
  type: FrameType;
  sessionId: number;
  sequence: number;
  payload: Buffer;
  auth: Buffer;
  raw: Buffer;
}

export async function createAccelerationRelayClient(
  options: AccelerationRelayOptions & AccelerationTarget,
): Promise<AccelerationRelayClient> {
  validateRelayOptions(options);
  const relayFamily = isIP(options.relayHost) === 6 ? "udp6" : "udp4";
  const relaySocket = createSocket(relayFamily);
  const localSocket = createSocket("udp4");
  const sessionId = randomSessionId();
  let sequence = 1;
  let ready = false;
  let closed = false;
  let resolveReady: () => void = () => undefined;
  let rejectReady: (error: Error) => void = () => undefined;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  const readyPromise = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const sendFrame = (type: FrameType, payload: Buffer<ArrayBufferLike> = Buffer.alloc(0)): void => {
    if (closed) return;
    const packet = encodeFrame(type, sessionId, sequence++, payload, options.token);
    try {
      relaySocket.send(packet, options.relayPort, options.relayHost);
    } catch (error) {
      if (!ready) rejectReady(asError(error));
    }
  };

  const closeSockets = (): void => {
    if (closed) return;
    closed = true;
    if (keepAlive) clearInterval(keepAlive);
    keepAlive = null;
    try { relaySocket.close(); } catch { /* already closed */ }
    try { localSocket.close(); } catch { /* already closed */ }
  };

  const onSocketError = (error: Error): void => {
    if (!ready) rejectReady(error);
    closeSockets();
  };
  relaySocket.once("error", onSocketError);
  localSocket.once("error", onSocketError);

  let peer: { address: string; port: number } | null = null;
  relaySocket.on("message", (packet) => {
    const frame = decodeFrame(packet);
    if (!frame || frame.sessionId !== sessionId || !verifyFrame(frame, options.token)) return;
    if (frame.type === FrameType.OPEN_OK) {
      if (ready) return;
      ready = true;
      keepAlive = setInterval(() => sendFrame(FrameType.PING), 10_000);
      keepAlive.unref?.();
      resolveReady();
      return;
    }
    if (frame.type === FrameType.OPEN_ERR) {
      const detail = parseJson(frame.payload);
      rejectReady(new Error(typeof detail?.code === "string" ? detail.code : "ACCELERATION_OPEN_FAILED"));
      closeSockets();
      return;
    }
    if (frame.type === FrameType.DATA && peer) {
      try { localSocket.send(frame.payload, peer.port, peer.address); } catch { /* peer is gone */ }
      return;
    }
    if (frame.type === FrameType.CLOSE) closeSockets();
  });

  await Promise.all([
    bindSocket(relaySocket, relayFamily === "udp6" ? "::" : "0.0.0.0"),
    bindSocket(localSocket, "127.0.0.1"),
  ]);

  localSocket.on("message", (payload, rinfo) => {
    if (closed) return;
    peer = { address: rinfo.address, port: rinfo.port };
    if (ready) sendFrame(FrameType.DATA, payload);
  });

  const timer = setTimeout(() => {
    rejectReady(new Error("ACCELERATION_OPEN_TIMEOUT"));
    closeSockets();
  }, options.timeoutMs ?? 15_000);
  timer.unref?.();
  sendFrame(FrameType.OPEN, jsonPayload({ targetHost: options.host, targetPort: options.port }));
  try {
    await readyPromise;
  } finally {
    clearTimeout(timer);
  }

  const address = localSocket.address();
  return {
    localHost: "127.0.0.1",
    localPort: typeof address === "object" ? address.port : 0,
    sessionId,
    close(): void {
      if (!closed && ready) {
        try { sendFrame(FrameType.CLOSE); } catch { /* best effort */ }
      }
      closeSockets();
    },
  };
}

export async function createAccelerationRelayServer({
  host = "0.0.0.0",
  port = 39087,
  token,
  allowPrivate = false,
  idleTimeoutMs = 30_000,
}: {
  host?: string;
  port?: number;
  token: string;
  allowPrivate?: boolean;
  idleTimeoutMs?: number;
}): Promise<{ host: string; port: number; close(): void }> {
  if (!token || token.length < 16) throw new Error("Acceleration relay token must contain at least 16 characters");
  const socket = createSocket(isIP(host) === 6 ? "udp6" : "udp4");
  const sessions = new Map<number, RelaySession>();
  let closed = false;

  const send = (session: RelaySession, type: FrameType, payload: Buffer<ArrayBufferLike> = Buffer.alloc(0)): void => {
    if (closed) return;
    try { socket.send(encodeFrame(type, session.id, session.outSequence++, payload, token), session.client.port, session.client.address); } catch { /* client is gone */ }
  };
  const cleanup = (session: RelaySession): void => {
    if (session.closed) return;
    session.closed = true;
    sessions.delete(session.id);
    session.targetSocket?.close();
  };

  socket.on("message", (packet, rinfo) => {
    const frame = decodeFrame(packet);
    if (!frame || !verifyFrame(frame, token)) return;
    const client = { address: rinfo.address, port: rinfo.port };
    if (frame.type === FrameType.OPEN) {
      void openRelaySession(frame, client, socket, sessions, token, allowPrivate, send, cleanup);
      return;
    }
    const session = sessions.get(frame.sessionId);
    if (!session || session.client.address !== rinfo.address || session.client.port !== rinfo.port) return;
    session.lastActivity = Date.now();
    if (frame.type === FrameType.DATA && session.targetSocket) session.targetSocket.send(frame.payload);
    else if (frame.type === FrameType.PING) send(session, FrameType.PONG);
    else if (frame.type === FrameType.CLOSE) { send(session, FrameType.CLOSE); cleanup(session); }
  });
  socket.on("error", (error) => {
    for (const session of sessions.values()) cleanup(session);
    if (!closed) throw error;
  });

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const session of sessions.values()) if (now - session.lastActivity > idleTimeoutMs) cleanup(session);
  }, Math.max(1000, Math.min(idleTimeoutMs, 5000)));
  sweep.unref?.();

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => { socket.off("listening", onListening); reject(error); };
    const onListening = () => { socket.off("error", onError); resolve(); };
    socket.once("error", onError);
    socket.once("listening", onListening);
    socket.bind({ address: host, port });
  });
  const address = socket.address();
  return {
    host,
    port: typeof address === "object" ? address.port : port,
    close(): void {
      if (closed) return;
      closed = true;
      clearInterval(sweep);
      for (const session of sessions.values()) cleanup(session);
      socket.close();
    },
  };
}

interface RelaySession {
  id: number;
  client: { address: string; port: number };
  targetSocket: ReturnType<typeof createSocket> | null;
  outSequence: number;
  lastActivity: number;
  closed: boolean;
}

async function openRelaySession(
  frame: Frame,
  client: { address: string; port: number },
  socket: ReturnType<typeof createSocket>,
  sessions: Map<number, RelaySession>,
  token: string,
  allowPrivate: boolean,
  send: (session: RelaySession, type: FrameType, payload?: Buffer) => void,
  cleanup: (session: RelaySession) => void,
): Promise<void> {
  const request = parseJson(frame.payload);
  if (!request || typeof request.targetHost !== "string" || !Number.isInteger(request.targetPort)) return;
  const targetPort = request.targetPort as number;
  if (!allowPrivate && isPrivateAddress(request.targetHost)) {
    socket.send(encodeFrame(FrameType.OPEN_ERR, frame.sessionId, 0, jsonPayload({ code: "PRIVATE_TARGET_BLOCKED" }), token), client.port, client.address);
    return;
  }
  const previous = sessions.get(frame.sessionId);
  if (previous) cleanup(previous);
  const session: RelaySession = { id: frame.sessionId, client, targetSocket: null, outSequence: 1, lastActivity: Date.now(), closed: false };
  sessions.set(session.id, session);
  try {
    const target = await resolveTarget(request.targetHost);
    const targetSocket = createSocket(target.family === 6 ? "udp6" : "udp4");
    session.targetSocket = targetSocket;
    targetSocket.on("message", (payload) => { session.lastActivity = Date.now(); send(session, FrameType.DATA, payload); });
    targetSocket.on("error", (error) => { if (!session.closed) send(session, FrameType.OPEN_ERR, jsonPayload({ code: "TARGET_SOCKET_ERROR", message: error.message })); cleanup(session); });
    targetSocket.connect(targetPort, target.host, () => {
      session.lastActivity = Date.now();
      send(session, FrameType.OPEN_OK, jsonPayload({ targetHost: target.host, targetPort }));
    });
  } catch (error) {
    cleanup(session);
    socket.send(encodeFrame(FrameType.OPEN_ERR, frame.sessionId, 0, jsonPayload({ code: "TARGET_OPEN_FAILED", message: asError(error).message }), token), client.port, client.address);
  }
}

function validateRelayOptions(options: AccelerationRelayOptions & AccelerationTarget): void {
  if (!options.relayHost || !Number.isInteger(options.relayPort) || options.relayPort < 1 || options.relayPort > 65535) throw new Error("Invalid acceleration relay endpoint");
  if (!options.host || !Number.isInteger(options.port) || options.port < 1 || options.port > 65535) throw new Error("Invalid accelerated TeamSpeak target");
  if (!options.token || options.token.length < 16) throw new Error("Acceleration relay token must contain at least 16 characters");
}

function bindSocket(socket: ReturnType<typeof createSocket>, address: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error) => { socket.off("listening", onListening); reject(error); };
    const onListening = () => { socket.off("error", onError); resolve(); };
    socket.once("error", onError);
    socket.once("listening", onListening);
    socket.bind(0, address);
  });
}

function encodeFrame(type: FrameType, sessionId: number, sequence: number, payload: Buffer, token: string): Buffer {
  if (payload.length > MAX_PAYLOAD_SIZE) throw new Error("Acceleration relay payload is too large");
  const frame = Buffer.alloc(HEADER_SIZE + payload.length);
  MAGIC.copy(frame, 0);
  frame[4] = VERSION;
  frame[5] = type;
  frame.writeUInt32BE(sessionId >>> 0, 8);
  frame.writeUInt32BE(sequence >>> 0, 12);
  frame.writeUInt16BE(payload.length, 16);
  payload.copy(frame, HEADER_SIZE);
  signFrame(frame, payload, token).copy(frame, 18);
  return frame;
}

function decodeFrame(packet: Buffer): Frame | null {
  if (packet.length < HEADER_SIZE || !packet.subarray(0, 4).equals(MAGIC) || packet[4] !== VERSION) return null;
  const payloadLength = packet.readUInt16BE(16);
  if (packet.length !== HEADER_SIZE + payloadLength || payloadLength > MAX_PAYLOAD_SIZE) return null;
  return { type: packet[5] as FrameType, sessionId: packet.readUInt32BE(8), sequence: packet.readUInt32BE(12), payload: packet.subarray(HEADER_SIZE), auth: packet.subarray(18, HEADER_SIZE), raw: packet };
}

function verifyFrame(frame: Frame, token: string): boolean {
  const expected = signFrame(frame.raw, frame.payload, token);
  return expected.length === frame.auth.length && timingSafeEqual(expected, frame.auth);
}

function signFrame(frame: Buffer, payload: Buffer, token: string): Buffer {
  return createHmac("sha256", Buffer.from(token, "utf8")).update(frame.subarray(0, 18)).update(payload).digest().subarray(0, 16);
}

function randomSessionId(): number {
  const id = randomBytes(4).readUInt32BE(0);
  return id === 0 ? 1 : id;
}

function jsonPayload(value: unknown): Buffer { return Buffer.from(JSON.stringify(value), "utf8"); }

function parseJson(payload: Buffer): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(payload.toString("utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch { return null; }
}

function isPrivateAddress(host: string): boolean {
  const family = isIP(host);
  if (family === 4) {
    const parts = host.split(".").map(Number);
    return parts[0] === 10 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168) || parts[0] === 127 || (parts[0] === 169 && parts[1] === 254) || parts[0] === 0;
  }
  if (family === 6) {
    const normalized = host.toLocaleLowerCase();
    return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
  }
  return host === "localhost" || host.endsWith(".localhost");
}

async function resolveTarget(host: string): Promise<{ host: string; family: number }> {
  const family = isIP(host);
  if (family) return { host, family };
  const records = await lookup(host, { all: true, verbatim: true });
  const record = records.find((item) => item.family === 4) ?? records[0];
  if (!record) throw new Error("TARGET_DNS_EMPTY");
  return { host: record.address, family: record.family };
}

function asError(error: unknown): Error { return error instanceof Error ? error : new Error(String(error)); }
