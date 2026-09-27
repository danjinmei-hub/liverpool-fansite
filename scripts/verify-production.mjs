import { readFile, appendFile } from "node:fs/promises";
import { verifyPublishedRelease } from "./release-verification.mjs";

const expected = JSON.parse(await readFile("out/release.json", "utf8"));
try {
  const result = await verifyPublishedRelease({ baseUrl: "https://redchorus.com", expected });
  const message = `Verified https://redchorus.com · ${expected.commitSha} · football snapshot ${expected.footballSnapshotLastUpdated} · ${result.pages.length} HTML routes + football.json (${result.attempts} attempt(s))`;
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${message}\n`);
} catch (error) {
  console.error(error);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `OSS publish verification failed: ${error.message}\n`);
  }
  process.exitCode = 1;
}
