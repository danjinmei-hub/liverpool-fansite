// Editorial copy is maintained independently of the football-data snapshot.
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const timestamp = (value) => typeof value === "string"
  && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value)
  && !Number.isNaN(Date.parse(value))
  && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);

export function matchEditorialError(value) {
  if (!record(value) || value.schemaVersion !== 1 || !record(value.matches)) {
    return "match editorial requires schemaVersion: 1 and a matches object";
  }
  for (const [id, entry] of Object.entries(value.matches)) {
    const path = `matches.${id}`;
    if (!/^[1-9]\d*$/.test(id) || !record(entry)) return `${path}: expected a numeric match ID and object`;
    for (const key of Object.keys(entry)) {
      if (!["headline", "context", "note", "sources", "publishedAt", "updatedAt", "featured"].includes(key)) {
        return `${path}.${key}: unknown editorial field`;
      }
    }
    if (!nonEmpty(entry.context) && !nonEmpty(entry.note)) return `${path}: context or note is required`;
    for (const field of ["headline", "context", "note"]) {
      if (field in entry && !nonEmpty(entry[field])) return `${path}.${field}: expected non-empty text`;
    }
    if (!timestamp(entry.publishedAt)) return `${path}.publishedAt: expected a UTC ISO timestamp`;
    if ("updatedAt" in entry && (!timestamp(entry.updatedAt)
      || Date.parse(entry.updatedAt) < Date.parse(entry.publishedAt))) {
      return `${path}.updatedAt: expected a UTC timestamp no earlier than publication`;
    }
    if ("featured" in entry && typeof entry.featured !== "boolean") return `${path}.featured: expected a boolean`;
    if ("sources" in entry) {
      if (!Array.isArray(entry.sources)) return `${path}.sources: expected an array`;
      for (const [index, source] of entry.sources.entries()) {
        let validUrl = false;
        try {
          const url = new URL(source?.url);
          validUrl = url.protocol === "https:" && Boolean(url.hostname);
        } catch { /* Invalid source URLs are rejected below. */ }
        if (!record(source) || !nonEmpty(source.label) || !nonEmpty(source.url)
          || !validUrl) {
          return `${path}.sources[${index}]: expected a label and HTTPS URL`;
        }
      }
    }
  }
  return null;
}

export function getMatchEditorial(data, matchId) {
  return data.matches[String(matchId)] ?? null;
}

export function getEditorialSections(entry) {
  if (!entry) return [];
  return [
    ...(entry.context ? [{ kind: "context", label: "CONTEXT", title: "这场比赛的位置", text: entry.context }] : []),
    ...(entry.note ? [{ kind: "note", label: "MATCH NOTE", title: "比赛笔记", text: entry.note }] : []),
    ...(entry.sources?.length ? [{ kind: "sources", label: "SOURCES", title: "资料来源", sources: entry.sources }] : []),
  ];
}

// Receives the existing sorted, current-season PL selection; never stores neighbours by hand.
export function getMatchThread(matches, matchId) {
  const index = matches.findIndex((match) => String(match.id) === String(matchId));
  if (index < 0) return null;
  return {
    previous: matches[index - 1] ?? null,
    next: matches[index + 1] ?? null,
  };
}
