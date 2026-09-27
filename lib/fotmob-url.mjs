// Preserve the existing Web-first URL policy; never derive a FotMob ID.
export function isCanonicalFotmobUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.origin === "https://www.fotmob.com" && !url.username && !url.password
      && /^\/matches\/[^/]+\/[^/]+$/.test(url.pathname) && !url.search && !url.hash;
  } catch {
    return false;
  }
}
