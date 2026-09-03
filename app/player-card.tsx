import Link from "next/link";
import type { Player } from "./squad-data";

export function PlayerCard({
  player,
  profileHint = false,
}: {
  player: Player;
  profileHint?: boolean;
}) {
  const card = (
    <article className="player-card" id={player.slug}>
      <div className="player-photo">
        <img
          src={player.image}
          alt={`${player.fullName} 的真实照片`}
          loading="lazy"
          style={{ objectPosition: player.photoPosition }}
        />
        <div className="player-photo-shade" aria-hidden="true" />
        <span className={`photo-context${player.transitional ? " is-transitional" : ""}`}>
          {player.photoContext}
        </span>
        <div className="player-number">{player.number}</div>
      </div>
      <div className="player-card-copy">
        <div className="player-info">
          <span>{player.position}</span>
          <h3>{player.name}</h3>
          <p>{player.role}</p>
          {player.profileHref ? <small>阅读个人档案 ↗</small> : null}
          {!player.profileHref && profileHint ? <small>个人档案 · 下一阶段开放</small> : null}
        </div>
      </div>
    </article>
  );

  return player.profileHref ? (
    <Link className="player-card-link" href={player.profileHref} aria-label={`阅读 ${player.fullName} 个人档案`}>
      {card}
    </Link>
  ) : card;
}
