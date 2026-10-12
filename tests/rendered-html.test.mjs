import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders production Worker HTML without development preview metadata", async (t) => {
  // The built Worker is production output; development-only markers do not belong here.
  const { readFile } = await import("node:fs/promises");
  const snapshot = JSON.parse(await readFile(new URL("../public/data/football.json", import.meta.url), "utf8"));
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(String(url), "https://raw.githubusercontent.com/danjinmei-hub/liverpool-fansite/main/public/data/football.json");
    return Response.json(snapshot);
  });
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /RED CHORUS/);
  assert.doesNotMatch(html, developmentPreviewMeta);
});
