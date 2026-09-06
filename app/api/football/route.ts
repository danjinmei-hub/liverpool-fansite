import { type FootballSnapshot } from "../../football-data";
import { getLatestFootballSnapshot } from "../../football-source";

const CACHE_CONTROL = "public, max-age=300, s-maxage=900, stale-while-revalidate=86400";

function response(snapshot: FootballSnapshot) {
  return Response.json(snapshot, {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}

export async function GET() {
  return response(await getLatestFootballSnapshot());
}
