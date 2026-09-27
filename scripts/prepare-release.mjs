import { resolve } from "node:path";
import { createReleaseManifest } from "./release-verification.mjs";

const manifest = await createReleaseManifest(resolve("out"), process.env.RELEASE_SHA ?? "");
console.log(`Prepared OSS release ${manifest.commitSha} · snapshot ${manifest.footballSnapshotLastUpdated}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import("node:fs/promises");
  await appendFile(process.env.GITHUB_STEP_SUMMARY,
    `OSS static build: ${manifest.commitSha} · football snapshot ${manifest.footballSnapshotLastUpdated}\n`);
}
