import type { MetadataRoute } from "next";
import { canonicalOrigin, isStaticProduction } from "./seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Preview pages must be crawlable so search engines can see their noindex tags.
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(isStaticProduction ? { sitemap: `${canonicalOrigin}/sitemap.xml` } : {}),
  };
}
