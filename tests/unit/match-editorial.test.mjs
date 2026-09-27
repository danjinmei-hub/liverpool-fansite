import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getEditorialSections, getMatchEditorial, getMatchThread, matchEditorialError } from "../../lib/match-editorial.mjs";
import { selectSeasonMatches } from "../../lib/football-snapshot.mjs";
import { makeMatch, makeSnapshot } from "../fixtures/football-snapshot.mjs";

const entry = {
  headline: "Test editorial headline",
  context: "A manually edited context.",
  note: "A manually edited note.",
  sources: [{ label: "Official source", url: "https://example.com/match" }],
  publishedAt: "2026-09-27T12:00:00Z",
  updatedAt: "2026-09-27T13:00:00Z",
  featured: false,
};

test("the committed editorial layer is valid and does not fabricate notes for finished matches", async () => {
  const data = JSON.parse(await readFile(new URL("../../data/match-editorial.json", import.meta.url), "utf8"));
  const snapshot = JSON.parse(await readFile(new URL("../../public/data/football.json", import.meta.url), "utf8"));
  assert.equal(matchEditorialError(data), null);
  for (const match of selectSeasonMatches(snapshot).filter((item) => item.status === "FINISHED")) {
    assert.deepEqual(getEditorialSections(getMatchEditorial(data, match.id)), []);
  }
});

test("published copy exposes only populated context, note and sources", () => {
  const data = { schemaVersion: 1, matches: { 101: entry } };
  assert.equal(matchEditorialError(data), null);
  assert.deepEqual(getEditorialSections(getMatchEditorial(data, 101)).map(({ kind }) => kind),
    ["context", "note", "sources"]);
  assert.deepEqual(getEditorialSections({ note: "One concise note", publishedAt: entry.publishedAt })
    .map(({ kind }) => kind), ["note"]);
  assert.deepEqual(getEditorialSections({ context: "Background", sources: [], publishedAt: entry.publishedAt })
    .map(({ kind }) => kind), ["context"]);
  assert.deepEqual(getEditorialSections(null), []);
  assert.equal(getMatchEditorial(data, 102), null);
});

test("editorial contract rejects unpublishable copy, malformed timestamps and unsafe source URLs", () => {
  const invalid = [
    [{ ...entry, publishedAt: undefined }, "publishedAt"],
    [{ ...entry, note: "   " }, "note"],
    [{ ...entry, updatedAt: "2026-09-26T12:00:00Z" }, "updatedAt"],
    [{ ...entry, sources: [{ label: "Source", url: "http://example.com" }] }, "sources[0]"],
    [{ ...entry, contxt: "typo" }, "contxt"],
    [{ headline: "No content", publishedAt: entry.publishedAt }, "context or note"],
  ];
  for (const [badEntry, error] of invalid) {
    assert.ok(matchEditorialError({ schemaVersion: 1, matches: { 101: badEntry } })?.includes(error));
  }
  assert.match(matchEditorialError({ schemaVersion: 2, matches: {} }), /schemaVersion/);
  assert.match(matchEditorialError({ schemaVersion: 1, matches: { unknown: entry } }), /numeric match ID/);
});

test("thread follows sorted current-season Liverpool PL order and handles boundaries", () => {
  const snapshot = makeSnapshot();
  snapshot.matches.push(
    { ...makeMatch(103), utcDate: "2026-11-01T12:00:00Z" },
    { ...makeMatch(104), competition: { code: "CL", name: "Champions League" }, utcDate: "2026-09-01T12:00:00Z" },
    { ...makeMatch(105), utcDate: "2025-08-01T12:00:00Z" },
  );
  const matches = selectSeasonMatches(snapshot);
  assert.deepEqual(matches.map(({ id }) => id), [101, 102, 103]);
  assert.deepEqual(getMatchThread(matches, 101), { previous: null, next: matches[1] });
  assert.deepEqual(getMatchThread(matches, 102), { previous: matches[0], next: matches[2] });
  assert.deepEqual(getMatchThread(matches, 103), { previous: matches[1], next: null });
  assert.equal(getMatchThread(matches, 104), null);
  assert.equal(getMatchThread([], 101), null);
});
