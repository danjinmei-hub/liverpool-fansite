import links from "../data/football-match-links.json";

type FotmobLink = { fotmobUrl: string; matchLabel: string; matchDate: string };

// Only editorially verified mappings may become outbound destinations.
// football-data IDs are lookup keys, never FotMob match IDs.
export function getFotmobLink(id: string | number): FotmobLink | null {
  const key = String(id);
  if (!Object.hasOwn(links, key)) return null;
  const entry = (links as Record<string, FotmobLink>)[key];
  try {
    const url = new URL(entry.fotmobUrl);
    if (url.origin !== "https://www.fotmob.com" ||
        url.username || url.password ||
        !/^\/matches\/[^/]+\/[^/]+$/.test(url.pathname) || url.search || url.hash) return null;
    return entry;
  } catch {
    return null;
  }
}
