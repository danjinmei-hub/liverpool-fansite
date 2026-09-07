import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const profilePath = new URL("../app/players/virgil-van-dijk/page.tsx", import.meta.url);
const squadPath = new URL("../app/squad-data.ts", import.meta.url);

test("Van Dijk profile keeps its editorial thesis and verified moments", async () => {
  const source = await readFile(profilePath, "utf8");

  assert.match(source, /archiveNumber: "003"/);
  assert.match(source, /sectionLabel: "THE STANDARD"/);
  assert.match(source, /label: "READ"/);
  assert.match(source, /label: "COMMAND"/);
  assert.match(source, /label: "RELEASE"/);
  assert.match(source, /label: "CALM"/);
  assert.match(source, /label: "RESPONSIBILITY"/);
  assert.match(source, /minute: "118’"/);
  assert.match(source, /Discipline, discipline and discipline!/);
  assert.match(source, /I really enjoy the fact of feeling that responsibility\./);
});

test("Van Dijk squad card links to the finished profile", async () => {
  const source = await readFile(squadPath, "utf8");
  const vanDijkCard = source.slice(
    source.indexOf('slug: "virgil-van-dijk"'),
    source.indexOf('slug: "milos-kerkez"'),
  );

  assert.match(vanDijkCard, /profileHref: "\/players\/virgil-van-dijk"/);
});
