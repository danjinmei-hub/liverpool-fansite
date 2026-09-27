import links from "../data/football-match-links.json";
import { isCanonicalFotmobUrl } from "../lib/fotmob-url.mjs";

type FotmobLink = { fotmobUrl: string; matchLabel: string; matchDate: string };

// Only editorially verified mappings may become outbound destinations.
// football-data IDs are lookup keys, never FotMob match IDs.
export function getFotmobLink(id: string | number): FotmobLink | null {
  const key = String(id);
  if (!Object.hasOwn(links, key)) return null;
  const entry = (links as Record<string, FotmobLink>)[key];
  return isCanonicalFotmobUrl(entry?.fotmobUrl) ? entry : null;
}
