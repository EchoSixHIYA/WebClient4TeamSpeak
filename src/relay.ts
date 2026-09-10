import { createAccelerationRelayServer } from "./server/acceleration-relay.js";

const token = process.env.WEBSPEAK_ACCELERATION_RELAY_TOKEN?.trim();
if (!token) throw new Error("WEBSPEAK_ACCELERATION_RELAY_TOKEN is required");

const server = await createAccelerationRelayServer({
  host: process.env.WEBSPEAK_ACCELERATION_RELAY_HOST?.trim() || "0.0.0.0",
  port: parsePort(process.env.WEBSPEAK_ACCELERATION_RELAY_PORT, 39087),
  token,
  allowPrivate: parseBoolean(process.env.WEBSPEAK_ACCELERATION_RELAY_ALLOW_PRIVATE),
});

console.log(`WebSpeak acceleration relay listening on ${server.host}:${server.port}`);

const shutdown = (): void => {
  server.close();
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

function parsePort(value: string | undefined, fallback: number): number {
  const port = value ? Number(value) : fallback;
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid WEBSPEAK_ACCELERATION_RELAY_PORT");
  return port;
}

function parseBoolean(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}
