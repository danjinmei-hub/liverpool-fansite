import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = join(root, ".static-build");
await mkdir(workspace, { recursive: true });
const staging = await mkdtemp(join(workspace, "export-"));

try {
  // An isolated copy keeps API routes, Sites config and Next-generated files in
  // the source checkout untouched. Never copy .env, .git, credentials or Workers.
  for (const entry of ["app", "components", "hooks", "lib", "data", "public", "vendor",
    "package.json", "package-lock.json", "next.config.ts", "postcss.config.mjs"]) {
    await cp(join(root, entry), join(staging, entry), {
      recursive: true,
      filter: (source) => source !== join(root, "app", "api"),
    });
  }
  const config = JSON.parse(await readFile(join(root, "tsconfig.json"), "utf8"));
  config.include = ["next-env.d.ts", "app/**/*.ts", "app/**/*.tsx", ".next/types/**/*.ts"];
  await writeFile(join(staging, "tsconfig.json"), JSON.stringify(config, null, 2));
  await symlink(join(root, "node_modules"), join(staging, "node_modules"), "dir");

  // ISR belongs to Sites. The static copy is regenerated in full by Actions.
  for (const page of ["app/matches/page.tsx", "app/matches/[id]/page.tsx"]) {
    const path = join(staging, page);
    const source = await readFile(path, "utf8");
    if (!source.includes("export const revalidate = 900;")) {
      throw new Error(`Review static route configuration after changing ${page}`);
    }
    await writeFile(path, source.replace("export const revalidate = 900;", "export const dynamicParams = false;"));
  }
  const result = spawnSync(process.execPath, [join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"], {
    cwd: staging,
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_STATIC_PRODUCTION: "1", NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Static build exited ${result.status}`);
  await readFile(join(staging, "out/index.html"));
  // Only replace our generated output after a successful build.
  await rm(join(root, "out"), { recursive: true, force: true });
  await cp(join(staging, "out"), join(root, "out"), { recursive: true });
  console.log("Static production output: out/ (no Node, Worker or API runtime)");
} finally {
  await rm(staging, { recursive: true, force: true });
}
