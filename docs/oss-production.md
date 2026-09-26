# RED CHORUS · OSS Hong Kong production readiness

## Two builds, one source

- `npm ci && npm run build:static && npm run test:static` produces **`out/`**.
- `npm run serve:static` serves only those files (default port 4173).
- Existing `npm run build` still builds the Vinext/Sites Worker. `.openai/hosting.json`, Vite, auth helpers and the existing API are retained. No Sites publication is performed by the production workflow.
- Static build uses an isolated, disposable `.static-build/` copy. `/api` is omitted only from that copy; the two match routes' ISR setting is replaced there with fixed static params. No generated config is written into the source checkout.
- Next.js `output: export`, `trailingSlash: true`; every known route has `route/index.html`. Images, fonts and CSS remain local. No runtime Node, Worker, image optimizer, database, football API key or ChatGPT login is needed.

## Snapshot contract

`football-data.org → existing Update football data workflow → public/data/football.json → build → out/`.

The build embeds the checked-out snapshot in initial HTML. In static mode the homepage provider refreshes from same-origin `/data/football.json` with `cache: no-store`; failed/invalid requests retain the embedded snapshot and its real `lastUpdated`. Sites continues to use `/api/football` and its existing remote/cache/fallback behavior.

`/matches` and every `/matches/[id]` are rendered from that same checked-out JSON. IDs remain URLs across status, date or score changes. FotMob fallback pages are generated only for editorially validated mappings. No URLs or match IDs are invented.

The archive is Liverpool Premier League only, within the snapshot season's July–June window. The shared selector filters older all-competition snapshots and deduplicates IDs; the updater now writes only PL fixtures. The pre-merge snapshot contained 46 unique fixtures: 38 PL and 8 Champions League. Only the 38 PL routes are exported. Smoke tests assert the exact exported ID set and 404 responses for excluded fixtures; the source JSON is preserved until its next automated refresh.

Publish the **whole output**, not just football.json: archive HTML, detail HTML, initial homepage data and JSON must belong to the same build. A file-only upload cannot regenerate HTML for new fixtures. The static archive updates on successful rebuild/publication, not ISR.

## Automatic build and OSS upload

`.github/workflows/production-static.yml` builds on main pushes, manual dispatch, and successful completion of `Update football data`. `workflow_run` is needed because pushes using `GITHUB_TOKEN` do not trigger downstream push workflows. It checks out latest main (the data workflow's head SHA precedes its generated commit), runs smoke tests and saves the validated `out/` artifact for 7 days. The separate publish job downloads **that same run's** artifact and checks out the build's exact source commit for the upload script. If main moved in the meantime, this job stops and leaves the next run to publish the newer version. The repository permissions are read-only; OSS credentials are provided only to the upload step. This workflow never downloads executable artifacts from another workflow or checks out a fork.

The upload script pins Alibaba Cloud ossutil 2.4.0 by SHA256 and restricts the destination to `redchorus-hk-prod` in Hong Kong. It uploads hashed Next assets first, briefly cached local assets second, HTML/RSC and the JSON snapshot third, and the root homepage last. It never deletes older OSS objects. Runs are serialized and a failed build or test prevents upload. An OSS upload does not configure static hosting, public read policy, a custom domain or DNS; browser-facing site validation must follow those separate settings.

Four GitHub repository Secrets for the upload job:

| Secret | Value |
| --- | --- |
| `OSS_ENDPOINT` | `oss-cn-hongkong.aliyuncs.com` (an `https://` prefix also works) |
| `OSS_BUCKET` | `redchorus-hk-prod` |
| `OSS_ACCESS_KEY_ID` | Dedicated, least-privilege RAM deployment identity |
| `OSS_ACCESS_KEY_SECRET` | Its secret; never a browser build variable or `NEXT_PUBLIC_*` value |

Limit the RAM identity to required object operations in this bucket; no account-wide admin, DNS or bucket-management permissions. `FOOTBALL_DATA_API_KEY` remains solely in the existing data update job. A future OIDC/STS setup may replace long-lived keys but is not required for this readiness change.

## Required OSS website settings (not applied by the upload workflow)

1. Hong Kong bucket, static website hosting; default page `index.html`, **enable subdirectory homepage**, support redirect `/matches/123` to `/matches/123/`. Error document `404.html` with real 404 status, not SPA fallback to `/index.html`.
2. Serve correct MIME types (`.html` text/html, `.js` text/javascript, `.css` text/css, `.json` application/json). Anonymous website assets must be readable under the chosen website policy. Configure custom-domain HTTPS separately; the bucket endpoint alone is not the finished public HTTPS setup.
3. Upload the contents of `out/` at bucket root (not an `out/` prefix). Keep `_next` and its text/RSC files intact; upload tools must include underscore-prefixed paths.
4. Cache: hashed `_next/static/*` → `public,max-age=31536000,immutable`; HTML, RSC text and `/data/football.json` → `no-cache` (or a reviewed short CDN TTL). Images use stable filenames: use revalidation, not immutable. Browser no-store does not override a misconfigured CDN.
5. Upload immutable assets first, then route HTML/RSC, JSON and homepage; retain old hashed assets for cached tabs. Never blindly `sync --delete` a bucket. Plain OSS multi-object upload is **not atomic**; document the brief mixed-release window, retain the previous complete artifact, and re-upload it for rollback. Stronger atomic cutovers can be added later if required.
6. Verify direct navigation/reload to all listed routes, a finished and future match, local images, JSON, FotMob and 375px layout against the actual OSS endpoint/custom domain before switching traffic. Local tests emulate directory indexes; they do not prove remote bucket/TLS settings.

The upload workflow does not purchase or change a bucket, RAM identity, DNS or `redchorus.com` binding. Publishing objects alone does not make an OSS service endpoint a browser-rendered website; a custom domain and HTTPS configuration are separate steps.

## Official references

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [GitHub workflow_run](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run)
- [GITHUB_TOKEN event limitations](https://docs.github.com/en/actions/concepts/security/github_token)
- [OSS static website hosting / subdirectory index](https://www.alibabacloud.com/help/en/oss/user-guide/hosting-static-websites)
