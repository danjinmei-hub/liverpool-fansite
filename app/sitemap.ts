import type { MetadataRoute } from "next";
import { fallbackFootballSnapshot, getSeasonMatches } from "./football-data";
import { canonicalOrigin, isStaticProduction } from "./seo";

export const dynamic = "force-static";

const staticPaths = [
  "/", "/squad/", "/history/", "/matches/",
  "/players/alisson-becker/",
  "/players/dominik-szoboszlai/",
  "/players/virgil-van-dijk/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isStaticProduction) return [];
  const paths = [
    ...staticPaths,
    ...getSeasonMatches(fallbackFootballSnapshot).map(({ id }) => `/matches/${id}/`),
  ];
  return paths.map((path) => ({ url: new URL(path, canonicalOrigin).toString() }));
}
