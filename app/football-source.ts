import {
  fallbackFootballSnapshot,
  isFootballSnapshot,
  type FootballSnapshot,
} from "./football-data";

const REMOTE_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/danjinmei-hub/liverpool-fansite/main/public/data/football.json";

export async function getLatestFootballSnapshot(): Promise<FootballSnapshot> {
  // One commit, one snapshot: the static build must never mix in a newer remote file.
  if (process.env.NEXT_PUBLIC_STATIC_PRODUCTION === "1") return fallbackFootballSnapshot;

  try {
    const remote = await fetch(REMOTE_SNAPSHOT_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(10_000),
    });

    if (!remote.ok) throw new Error(`Snapshot request failed: ${remote.status}`);

    const snapshot: unknown = await remote.json();
    if (!isFootballSnapshot(snapshot)) throw new Error("Snapshot schema is invalid");
    return Date.parse(snapshot.lastUpdated) >= Date.parse(fallbackFootballSnapshot.lastUpdated)
      ? snapshot : fallbackFootballSnapshot;
  } catch {
    return fallbackFootballSnapshot;
  }
}
