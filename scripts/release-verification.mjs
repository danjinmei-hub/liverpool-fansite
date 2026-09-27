import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { footballSnapshotError, selectSeasonMatches } from "../lib/football-snapshot.mjs";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createReleaseManifest(directory, commitSha) {
  if (!/^[0-9a-f]{40}$/.test(commitSha)) throw new Error("Expected a full Git commit SHA");
  const snapshotBytes = await readFile(join(directory, "data/football.json"));
  const snapshot = JSON.parse(snapshotBytes);
  const error = footballSnapshotError(snapshot);
  if (error) throw new Error(`Invalid published football snapshot: ${error}`);

  const seasonMatches = selectSeasonMatches(snapshot);
  const match = seasonMatches.find(({ status }) => status === "FINISHED") ?? seasonMatches[0];
  if (!match) throw new Error("No current-season Liverpool PL match page to verify");
  const paths = ["/", "/matches/", `/matches/${match.id}/`, "/players/virgil-van-dijk/"];
  const pages = await Promise.all(paths.map(async (path) => ({
    path,
    sha256: hash(await readFile(join(directory, path.slice(1), "index.html"))),
  })));
  const manifest = {
    schemaVersion: 1,
    commitSha,
    footballSnapshotLastUpdated: snapshot.lastUpdated,
    footballSnapshotSha256: hash(snapshotBytes),
    buildTarget: "next-static-export",
    deploymentType: "oss-production",
    pages,
  };
  await writeFile(join(directory, "release.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function verifyPublishedRelease({
  baseUrl, expected, attempts = 6, retryDelayMs = 10_000, fetchImpl = fetch, sleep = delay,
}) {
  const origin = new URL(baseUrl);
  if (!["https:", "http:"].includes(origin.protocol)) throw new Error("Expected an HTTP(S) website");
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error("Expected at least one attempt");

  async function get(path, attempt, contentType) {
    const url = new URL(path, origin);
    url.searchParams.set("release_check", `${expected.commitSha}-${attempt}`);
    const response = await fetchImpl(url, {
      headers: { Accept: contentType, "Cache-Control": "no-cache" },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (new URL(response.url).origin !== origin.origin) throw new Error(`${path}: redirected outside production domain`);
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    if (!response.headers.get("content-type")?.includes(contentType)) {
      throw new Error(`${path}: unexpected content type ${response.headers.get("content-type")}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const live = JSON.parse(await get("/release.json", attempt, "application/json"));
      if (JSON.stringify(live) !== JSON.stringify(expected)) {
        throw new Error(`release.json: expected commit ${expected.commitSha}, snapshot ${expected.footballSnapshotLastUpdated}; received commit ${live.commitSha ?? "missing"}, snapshot ${live.footballSnapshotLastUpdated ?? "missing"}`);
      }
      await Promise.all([
        ...expected.pages.map(async ({ path, sha256 }) => {
          const bytes = await get(path, attempt, "text/html");
          if (hash(bytes) !== sha256) throw new Error(`${path}: HTML differs from build ${expected.commitSha}`);
        }),
        (async () => {
          const bytes = await get("/data/football.json", attempt, "application/json");
          if (hash(bytes) !== expected.footballSnapshotSha256) {
            throw new Error("/data/football.json: snapshot differs from published build");
          }
          const snapshot = JSON.parse(bytes);
          if (snapshot.lastUpdated !== expected.footballSnapshotLastUpdated) {
            throw new Error("/data/football.json: lastUpdated differs from release manifest");
          }
        })(),
      ]);
      return { attempts: attempt, pages: expected.pages.map(({ path }) => path) };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(retryDelayMs);
    }
  }
  throw new Error(`Production verification failed after ${attempts} attempts: ${lastError.message}`);
}
