import { createSocket } from "node:dgram";
import { createRelayServer } from "./relay-server.mjs";
import { createRelayClient } from "./relay-client.mjs";

const TOKEN = "local-ipv6-acceleration-poc-token";
const PACKET_COUNT = 50;

function bind(socket, port = 0) {
  return new Promise((resolve, reject) => {
    socket.once("error", reject);
    socket.bind(port, "::1", () => {
      socket.off("error", reject);
      resolve();
    });
  });
}

async function run() {
  const target = createSocket("udp6");
  target.on("message", (payload, rinfo) => target.send(payload, rinfo.port, rinfo.address));
  await bind(target);
  const targetPort = target.address().port;

  const relay = await createRelayServer({ host: "::1", port: 0, token: TOKEN, allowPrivate: true });
  const client = await createRelayClient({
    relayHost: "::1",
    relayPort: relay.port,
    targetHost: "::1",
    targetPort,
    token: TOKEN,
    localHost: "::1",
  });

  const sender = createSocket("udp6");
  await bind(sender);
  const pending = new Set(Array.from({ length: PACKET_COUNT }, (_, index) => index));
  sender.on("message", (payload) => pending.delete(payload.readUInt32BE(0)));
  for (let index = 0; index < PACKET_COUNT; index++) {
    const payload = Buffer.alloc(512, index & 0xff);
    payload.writeUInt32BE(index, 0);
    sender.send(payload, client.localPort, "::1");
  }

  const deadline = Date.now() + 3000;
  while (pending.size && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 10));
  const received = PACKET_COUNT - pending.size;

  sender.close();
  client.close();
  relay.close();
  target.close();
  console.log(`ipv6_packets=${PACKET_COUNT} received=${received} loss=${((pending.size / PACKET_COUNT) * 100).toFixed(2)}%`);
  if (received !== PACKET_COUNT) throw new Error("IPV6_ACCELERATION_POC_FAILED");
  console.log("IPV6_ACCELERATION_POC_OK");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
