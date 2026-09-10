import assert from "node:assert/strict";
import test from "node:test";
import { isRestrictedAddress, resolveSafeOpenTarget } from "../src/security/open-target-policy.js";

test("open mode blocks loopback, private, link-local, multicast and reserved ranges", () => {
  for (const address of [
    "0.0.0.0", "10.1.2.3", "100.64.0.1", "127.0.0.1", "169.254.1.2",
    "172.16.0.1", "192.168.1.2", "224.0.0.1", "255.255.255.255",
    "::", "::1", "::7f00:1", "fc00::1", "fe80::1", "fec0::1", "ff02::1", "2001:db8::1",
  ]) assert.equal(isRestrictedAddress(address), true, address);
  assert.equal(isRestrictedAddress("8.8.8.8"), false);
  assert.equal(isRestrictedAddress("2606:4700:4700::1111"), false);
});

test("validated literal target is returned for the actual connection", async () => {
  assert.deepEqual(await resolveSafeOpenTarget({ host: "8.8.8.8", port: 9987 }), { host: "8.8.8.8", port: 9987 });
  assert.deepEqual(await resolveSafeOpenTarget({ host: "2606:4700:4700::1111", port: 9987 }), { host: "2606:4700:4700::1111", port: 9987 });
  await assert.rejects(resolveSafeOpenTarget({ host: "127.0.0.1", port: 9987 }));
});
