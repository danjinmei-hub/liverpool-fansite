#!/usr/bin/env bash
set -euo pipefail

# A dedicated bucket guard prevents a misconfigured secret from changing another site.
if [[ "${OSS_BUCKET:-}" != "redchorus-hk-prod" ]]; then
  echo "Expected the dedicated Hong Kong production bucket." >&2
  exit 1
fi
case "${OSS_ENDPOINT:-}" in
  oss-cn-hongkong.aliyuncs.com|https://oss-cn-hongkong.aliyuncs.com) ;;
  *) echo "Expected the Hong Kong OSS public endpoint." >&2; exit 1 ;;
esac
if [[ -z "${OSS_ACCESS_KEY_ID:-}" || -z "${OSS_ACCESS_KEY_SECRET:-}" ]]; then
  echo "OSS upload credentials are missing." >&2
  exit 1
fi
export OSS_ENDPOINT=https://oss-cn-hongkong.aliyuncs.com
export OSS_REGION=cn-hongkong

site_dir="${1:-out}"
for required in index.html matches/index.html data/football.json; do
  if [[ ! -f "$site_dir/$required" ]]; then
    echo "Static output is incomplete: $required" >&2
    exit 1
  fi
done

destination="oss://$OSS_BUCKET/"
staging=$(mktemp -d)
trap 'rm -rf "$staging"' EXIT

# Publish hashed assets before pages which can reference them. Old assets remain
# available to previously opened tabs; this workflow never deletes bucket objects.
ossutil cp -r "$site_dir/_next/static/" "${destination}_next/static/" \
  -f -j 8 --no-progress --cache-control 'public,max-age=31536000,immutable'

# Stable assets (including local photographs) can be cached briefly.
mkdir "$staging/assets"
cp -a "$site_dir/." "$staging/assets/"
rm -rf "$staging/assets/_next/static"
find "$staging/assets" -type f \( -name '*.html' -o -name '*.txt' -o -name '*.json' \) -delete
ossutil cp -r "$staging/assets/" "$destination" \
  -f -j 8 --no-progress --cache-control 'public,max-age=3600'

# Next.js route HTML/RSC and the snapshot are published from the same artifact.
# The homepage is uploaded last so it cannot point to yet-to-be-uploaded assets.
mkdir "$staging/pages"
cp -a "$site_dir/." "$staging/pages/"
rm -rf "$staging/pages/_next/static"
find "$staging/pages" -type f ! \( -name '*.html' -o -name '*.txt' -o -name '*.json' \) -delete
rm "$staging/pages/index.html" "$staging/pages/data/football.json"
ossutil cp -r "$staging/pages/" "$destination" \
  -f -j 8 --no-progress --cache-control 'no-cache'
ossutil cp "$site_dir/data/football.json" "${destination}data/football.json" \
  -f --no-progress --cache-control 'no-cache' --content-type 'application/json; charset=utf-8'
ossutil cp "$site_dir/index.html" "${destination}index.html" \
  -f --no-progress --cache-control 'no-cache' --content-type 'text/html; charset=utf-8'
