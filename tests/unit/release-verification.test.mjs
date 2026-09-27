import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { staticServer } from "../../scripts/serve-static.mjs";
import { createReleaseManifest, verifyPublishedRelease } from "../../scripts/release-verification.mjs";
import { makeSnapshot } from "../fixtures/football-snapshot.mjs";

const sha = "a".repeat(40);

test("release manifest binds the exact static pages, Git commit and football snapshot", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "red-chorus-release-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const snapshot = makeSnapshot();
  const paths = ["", "matches", "matches/101", "players/virgil-van-dijk"];
  for (const path of paths) {
    await mkdir(join(directory, path), { recursive: true });
    await writeFile(join(directory, path, "index.html"), `<html>RED CHORUS ${path}</html>`);
  }
  await mkdir(join(directory, "data"));
  await writeFile(join(directory, "data/football.json"), JSON.stringify(snapshot));
  await writeFile(join(directory, "robots.txt"), "User-Agent: *\nAllow: /\n");
  await writeFile(join(directory, "sitemap.xml"), "<urlset></urlset>");
  await writeFile(join(directory, "404.html"), "not found");
  await assert.rejects(createReleaseManifest(directory, "short"), /full Git commit SHA/);

  const manifest = await createReleaseManifest(directory, sha);
  assert.equal(manifest.commitSha, sha);
  assert.equal(manifest.footballSnapshotLastUpdated, snapshot.lastUpdated);
  assert.deepEqual(manifest.pages.map(({ path }) => path),
    ["/", "/matches/", "/matches/101/", "/players/virgil-van-dijk/"]);
  assert.deepEqual(manifest.seoFiles.map(({ path }) => path), ["/robots.txt", "/sitemap.xml"]);

  const server = staticServer(directory).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const options = { baseUrl, expected: manifest, attempts: 1 };
  assert.equal((await verifyPublishedRelease(options)).attempts, 1);

  const matchFile = join(directory, "matches/101/index.html");
  const originalMatch = await readFile(matchFile);
  await writeFile(matchFile, "<html>other release</html>");
  await assert.rejects(verifyPublishedRelease(options), /matches\/101\/: HTML differs/);
  await writeFile(matchFile, originalMatch);

  const dataFile = join(directory, "data/football.json");
  await writeFile(dataFile, JSON.stringify({ ...snapshot, lastUpdated: "2026-09-27T00:00:00Z" }));
  await assert.rejects(verifyPublishedRelease(options), /football.json: snapshot differs/);
  await writeFile(dataFile, JSON.stringify(snapshot));

  await writeFile(join(directory, "sitemap.xml"), "<urlset>stale</urlset>");
  await assert.rejects(verifyPublishedRelease(options), /sitemap.xml: differs/);
  await writeFile(join(directory, "sitemap.xml"), "<urlset></urlset>");

  const manifestFile = join(directory, "release.json");
  await writeFile(manifestFile, JSON.stringify({ ...manifest, commitSha: "b".repeat(40) }));
  await assert.rejects(verifyPublishedRelease(options), /expected commit a+, snapshot/);
  let retries = 0;
  const result = await verifyPublishedRelease({ ...options, attempts: 2, sleep: async () => {
    retries++;
    await writeFile(manifestFile, `${JSON.stringify(manifest)}\n`);
  } });
  assert.equal(retries, 1);
  assert.equal(result.attempts, 2);
});
