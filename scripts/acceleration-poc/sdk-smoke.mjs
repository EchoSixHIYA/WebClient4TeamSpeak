import { Client, generateIdentity } from "../../../teamspeak-js/dist/index.mjs";
import { createRelayClient } from "./relay-client.mjs";
import { createRelayServer } from "./relay-server.mjs";
import { parseEndpoint } from "./protocol.mjs";

const token = process.env.WEBSPEAK_ACCEL_TOKEN ?? "local-acceleration-poc-token";
const target = parseEndpoint(process.env.WEBSPEAK_ACCEL_TS_TARGET ?? "106.15.36.235#9987", 9987);
const relayEndpoint = process.env.WEBSPEAK_ACCEL_RELAY;
let relayServer = null;
let relayClient = null;
let tsClient = null;

function withTimeout(promise, timeoutMs, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), timeoutMs)),
  ]);
}

try {
  let relay;
  if (relayEndpoint) {
    relay = parseEndpoint(relayEndpoint, 39087);
  } else {
    relayServer = await createRelayServer({ host: "127.0.0.1", port: 0, token, allowPrivate: true });
    relay = { host: "127.0.0.1", port: relayServer.port };
  }

  relayClient = await createRelayClient({
    relayHost: relay.host,
    relayPort: relay.port,
    targetHost: target.host,
    targetPort: target.port,
    token,
  });

  tsClient = new Client(generateIdentity(8), `127.0.0.1:${relayClient.localPort}`, "acceleration-sdk-smoke");
  await withTimeout(tsClient.connect(), 15_000, "TS_CONNECT");
  console.log(`TS_ACCEL_CONNECTED target=${target.host}#${target.port}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  await tsClient.disconnect();
  console.log("TS_ACCEL_DISCONNECTED");
} catch (error) {
  console.error("TS_ACCEL_SMOKE_FAILED", error);
  process.exitCode = 1;
} finally {
  try { await tsClient?.disconnect(); } catch {}
  relayClient?.close();
  relayServer?.close();
}
