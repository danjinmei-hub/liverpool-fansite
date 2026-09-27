# Match editorial

`match-editorial.json` contains manually reviewed writing only. Football facts remain in
`public/data/football.json`; match IDs come from that snapshot and are never FotMob IDs.

Add one entry under `matches` to publish a journal note. For example (illustrative ID and text only):

```json
{
  "schemaVersion": 1,
  "matches": {
    "123456": {
      "headline": "A concise editorial headline",
      "context": "What this fixture means within the season.",
      "note": "An observation checked by a human editor.",
      "sources": [{ "label": "Official match report", "url": "https://example.com/report" }],
      "publishedAt": "2026-09-27T12:00:00Z",
      "updatedAt": "2026-09-27T13:00:00Z",
      "featured": false
    }
  }
}
```

`context` or `note` is required; the other, plus `headline`, `sources`, `updatedAt`,
and `featured`, is optional. `publishedAt` is required for every committed entry,
in UTC ISO format. Sources must have labels and HTTPS URLs. `featured` is reserved
for future editorial selection and currently changes nothing on the site. Empty
entries are omitted entirely: no journal section is rendered. Page order and
previous/next links always follow the current season's Liverpool PL matches.
