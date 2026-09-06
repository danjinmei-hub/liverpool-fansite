import { type FootballMatch, type FootballSnapshot } from "../football-data";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  timeZone: "Asia/Shanghai",
});

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

const updateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Shanghai",
});

export const completedStatuses = new Set(["FINISHED", "AWARDED"]);

export function matchStatus(status: string) {
  if (completedStatuses.has(status)) return "已完赛";
  if (status === "IN_PLAY" || status === "PAUSED") return "进行中";
  if (status === "POSTPONED") return "已延期";
  if (status === "CANCELLED") return "已取消";
  return "已排定";
}

export function matchCompetition(match: FootballMatch, snapshot: FootballSnapshot) {
  const competition = match.competition?.name ?? snapshot.competition.name;
  return match.matchday ? `${competition} · Matchday ${match.matchday}` : competition;
}

export function matchDate(match: FootballMatch) {
  return dateFormatter.format(new Date(match.utcDate));
}

export function matchTime(match: FootballMatch) {
  return timeFormatter.format(new Date(match.utcDate));
}

export function updateDate(snapshot: FootballSnapshot) {
  return updateFormatter.format(new Date(snapshot.lastUpdated)).toUpperCase();
}

export function seasonLabel(startYear: number) {
  return `${startYear} / ${String(startYear + 1).slice(-2)}`;
}
