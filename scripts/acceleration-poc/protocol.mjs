import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const VERSION = 1;
export const HEADER_SIZE = 34;
export const MAX_PAYLOAD_SIZE = 60_000;

export const FrameType = Object.freeze({
  OPEN: 1,
  OPEN_OK: 2,
  OPEN_ERR: 3,
  DATA: 4,
  CLOSE: 5,
  PING: 6,
  PONG: 7,
});

function asSecret(secret) {
  if (typeof secret !== "string" || secret.length < 16) {
    throw new Error("The PoC token must contain at least 16 characters");
  }
  return Buffer.from(secret, "utf8");
}

function signFrame(frame, secret, payload) {
  return createHmac("sha256", asSecret(secret))
    .update(frame.subarray(0, 18))
    .update(payload)
    .digest()
    .subarray(0, 16);
}

export function encodeFrame(type, sessionId, sequence, payload = Buffer.alloc(0), secret) {
  const body = Buffer.from(payload);
  if (!Number.isInteger(type) || type < 1 || type > 255) throw new Error("Invalid frame type");
  if (!Number.isInteger(sessionId) || sessionId < 0 || sessionId > 0xffffffff) throw new Error("Invalid session id");
  if (!Number.isInteger(sequence) || sequence < 0 || sequence > 0xffffffff) throw new Error("Invalid sequence");
  if (body.length > MAX_PAYLOAD_SIZE) throw new Error(`Payload exceeds ${MAX_PAYLOAD_SIZE} bytes`);

  const frame = Buffer.alloc(HEADER_SIZE + body.length);
  MAGIC.copy(frame, 0);
  frame[4] = VERSION;
  frame[5] = type;
  frame.writeUInt16BE(0, 6);
  frame.writeUInt32BE(sessionId >>> 0, 8);
  frame.writeUInt32BE(sequence >>> 0, 12);
  frame.writeUInt16BE(body.length, 16);
  body.copy(frame, HEADER_SIZE);
  signFrame(frame, secret, body).copy(frame, 18);
  return frame;
}

export function decodeFrame(packet) {
  const frame = Buffer.from(packet);
  if (frame.length < HEADER_SIZE || !frame.subarray(0, 4).equals(MAGIC)) return null;
  if (frame[4] !== VERSION) return null;
  const payloadLength = frame.readUInt16BE(16);
  if (frame.length !== HEADER_SIZE + payloadLength || payloadLength > MAX_PAYLOAD_SIZE) return null;
  return {
    type: frame[5],
    sessionId: frame.readUInt32BE(8),
    sequence: frame.readUInt32BE(12),
    payload: frame.subarray(HEADER_SIZE),
    auth: frame.subarray(18, HEADER_SIZE),
    raw: frame,
  };
}

export function verifyFrame(frame, secret) {
  const expected = signFrame(frame.raw, secret, frame.payload);
  return timingSafeEqual(expected, frame.auth);
}

export function randomSessionId() {
  let id = randomBytes(4).readUInt32BE(0);
  if (id === 0) id = 1;
  return id;
}

export function jsonPayload(value) {
  return Buffer.from(JSON.stringify(value), "utf8");
}

export function parseJsonPayload(payload) {
  try {
    return JSON.parse(Buffer.from(payload).toString("utf8"));
  } catch {
    return null;
  }
}

export function parseEndpoint(value, defaultPort) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Endpoint is required");
  const text = value.trim();
  if (text.startsWith("[")) {
    const end = text.indexOf("]");
    if (end < 0) throw new Error(`Invalid endpoint: ${value}`);
    const host = text.slice(1, end);
    const portText = text.slice(end + 1).replace(/^[:#]/, "");
    return { host, port: parsePort(portText || defaultPort, value) };
  }
  const hash = text.lastIndexOf("#");
  if (hash > 0) return { host: text.slice(0, hash), port: parsePort(text.slice(hash + 1), value) };
  const colon = text.lastIndexOf(":");
  if (colon > 0 && text.indexOf(":") === colon) {
    return { host: text.slice(0, colon), port: parsePort(text.slice(colon + 1), value) };
  }
  return { host: text, port: parsePort(defaultPort, value) };
}

function parsePort(value, original) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Invalid port in endpoint: ${original}`);
  return port;
}

const MAGIC = Buffer.from("WSAT");
