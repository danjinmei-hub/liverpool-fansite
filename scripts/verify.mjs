import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const target = process.argv[2] ?? "all";
if (!["all", "static", "sites"].includes(target) || process.argv.length > 3) {
  console.error("Usage: node scripts/verify.mjs [all|static|sites]");
  process.exit(2);
}

function run(label, command, args) {
  console.log(`\n[quality gate] ${label}`);
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error(`[quality gate] FAIL: ${label}`, result.error ?? result.signal ?? result.status);
    process.exit(result.status || 1);
  }
  console.log(`[quality gate] PASS: ${label}`);
}
const npm = (label, script) => run(label, "npm", ["run", script]);
async function tests(label, directory) {
  const files = (await readdir(new URL(`${directory}/`, new URL("../", import.meta.url))))
    .filter((file) => file.endsWith(".test.mjs")).sort().map((file) => `${directory}/${file}`);
  if (!files.length) throw new Error(`No tests found in ${directory}`);
  run(label, process.execPath, ["--test", ...files]);
}

// Production CI splits these same stages across two jobs. Shared checks run once.
if (target !== "sites") {
  npm("Lint source", "lint");
  await tests("Core units, football data, FotMob and release verifier", "tests/unit");
  npm("Offline FotMob mapping audit (absence warns)", "audit:fotmob");
  npm("Next static production build and TypeScript", "build:static");
  npm("Static HTTP routes, assets, snapshot and SEO", "test:static");
  npm("Chromium desktop and mobile smoke / data fallback", "test:e2e");
  run("Release manifest and served artifact agree", process.execPath, ["scripts/verify-static-release.mjs"]);
}
if (target !== "static") {
  npm("Sites / Vinext build", "build");
  await tests("All existing Sites rendering and component checks", "tests");
}
console.log(`\n[quality gate] PASS: ${target}. No publication performed.`);
