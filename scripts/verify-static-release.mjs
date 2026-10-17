import { execFileSync } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { createReleaseManifest, verifyPublishedRelease } from "./release-verification.mjs";
import { staticServer } from "./serve-static.mjs";

const sha = process.env.RELEASE_SHA ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const expected = await createReleaseManifest(resolve("out"), sha);
const server = staticServer("out").listen(0, "127.0.0.1");
try {
  await once(server, "listening");
  await verifyPublishedRelease({ baseUrl: `http://127.0.0.1:${server.address().port}`, expected, attempts: 1 });
  console.log(`Verified local release ${sha} · snapshot ${expected.footballSnapshotLastUpdated}`);
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
