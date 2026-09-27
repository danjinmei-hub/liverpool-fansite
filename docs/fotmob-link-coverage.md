# FotMob Match Link Coverage v1

`data/football-match-links.json` is the sole verified-link authority. The
`fotmobUrl` copied into the football snapshot is not used to calculate coverage.
The football-data updater, request count, six-hour schedule and page UI are unchanged.

## Add or reverify a link

Open the official FotMob match page and check the competition, home/away order,
full calendar date, and (for a finished match) score against the snapshot.
Never infer a FotMob match ID from a football-data ID or build a guessed URL.
Keep uncertain fixtures unmapped. Future fixtures require the same verification.

Each entry records:

- JSON key: **football-data match ID**.
- `fotmobUrl`: checked canonical HTTPS match URL, with the existing no-query/no-fragment policy.
- `matchLabel`: human-readable home/away pairing, optionally the verified result.
- `matchDate`: date in **UTC**, not the visitor's local date.
- `homeTeamId` / `awayTeamId`: **football-data team IDs**, in verified home/away order.
  They are comparison keys, not FotMob IDs; the URL is never derived from them.
- `verificationSource`: the actual FotMob match-page URL checked, equal to `fotmobUrl`.
- `verifiedAt`: date the page was actually checked.

## Offline audit

Run `npm run audit:fotmob` and `npm run test:fotmob`.
The existing production workflow runs both after football tests, including when
the data-update workflow completes. The audit writes counts and individual gaps
to the Actions log and job summary. Finished/AWARDED fixtures without a valid
mapping generate warning annotations and **do not fail deployment**.

Invalid metadata/URLs, duplicate destinations, orphan entries (outside the current
Liverpool PL archive), and date/team mismatches fail the audit. Investigate and
reverify or remove a bad mapping rather than guessing a replacement. If a match is
rescheduled, recheck its page before updating its recorded date.

This is an offline consistency check, **not proof that a remote page still displays
the same fixture**. Pair-based canonical URLs can change their selected fixture;
review the official page when reusing/revising an entry, especially before mapping
the reverse fixture. No scraper, periodic FotMob request or App deep-link workaround
is added. iOS Universal Link behaviour is unchanged.

## Verification record — 2026-09-26

The official pages below were opened and their main scoreboard plus “About the
match” date/venue checked. These are verified facts, not inferred from URL slugs.

| football-data ID | Home → away | Kickoff UTC | Result | Official source |
| --- | --- | --- | --- | --- |
| 560550 | Newcastle United → Liverpool | 2026-08-23 15:30 | 2–2 | [FotMob](https://www.fotmob.com/matches/liverpool-vs-newcastle-united/2ygyxm) |
| 560552 | Liverpool → Nottingham Forest | 2026-08-29 11:30 | 2–2 | [FotMob](https://www.fotmob.com/matches/liverpool-vs-nottingham-forest/2xthvt) |
| 560566 | Ipswich Town → Liverpool | 2026-09-04 19:00 | 0–2 | [FotMob](https://www.fotmob.com/matches/liverpool-vs-ipswich-town/2ugv0q) |
| 560573 | Liverpool → Fulham | 2026-09-12 14:00 | 0–0 | [FotMob](https://www.fotmob.com/matches/liverpool-vs-fulham/2u7pyg) |
| 560582 | AFC Bournemouth → Liverpool | 2026-09-20 13:00 | 0–1 | [FotMob](https://www.fotmob.com/matches/liverpool-vs-afc-bournemouth/2he69q) |

At this check: 38 season fixtures, 5 finished, all 5 finished verified. The remaining
33 fixtures were not verified in this pass and remain unmapped; these are not
claims that FotMob lacks pages for them. Use the audit output for live repository
counts as the season advances.
