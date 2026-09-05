import {
  fallbackFootballSnapshot,
  isFootballSnapshot,
  type FootballSnapshot,
} from "../../football-data";

const REMOTE_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/danjinmei-hub/liverpool-fansite/main/public/data/football.json";

const CACHE_CONTROL = "public, max-age=300, s-maxage=900, stale-while-revalidate=86400";

function response(snapshot: FootballSnapshot) {
  return Response.json(snapshot, {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}

export async function GET() {
  try {
    const remote = await fetch(REMOTE_SNAPSHOT_URL, {
      headers: { Accept: "application/json" },
    });

    if (!remote.ok) throw new Error(`Snapshot request failed: ${remote.status}`);

    const snapshot: unknown = await remote.json();
    if (!isFootballSnapshot(snapshot)) throw new Error("Snapshot schema is invalid");

    return response(snapshot);
  } catch {
    return response(fallbackFootballSnapshot);
  }
}
