import {
  fallbackFootballSnapshot,
  isFootballSnapshot,
  type FootballSnapshot,
} from "./football-data";

const REMOTE_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/danjinmei-hub/liverpool-fansite/main/public/data/football.json";

export async function getLatestFootballSnapshot(): Promise<FootballSnapshot> {
  try {
    const remote = await fetch(REMOTE_SNAPSHOT_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });

    if (!remote.ok) throw new Error(`Snapshot request failed: ${remote.status}`);

    const snapshot: unknown = await remote.json();
    if (!isFootballSnapshot(snapshot)) throw new Error("Snapshot schema is invalid");
    return snapshot;
  } catch {
    return fallbackFootballSnapshot;
  }
}
