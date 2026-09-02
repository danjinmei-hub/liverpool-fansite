import { ArrowUpRight, Camera } from "lucide-react";
import type { Player } from "./squad-data";

export function PhotoCredits({ players }: { players: Player[] }) {
  return (
    <details className="photo-credits">
      <summary>
        <Camera aria-hidden="true" size={17} />
        查看球员照片来源与授权
      </summary>
      <div className="photo-credit-grid">
        {players.map((player) => (
          <div className="photo-credit-item" key={`${player.slug}-credit`}>
            <a href={player.source} target="_blank" rel="noreferrer">
              <strong>{player.fullName}</strong>
              <ArrowUpRight aria-hidden="true" size={14} />
            </a>
            <span>
              {player.credit} ·{" "}
              <a href={player.license.href} target="_blank" rel="noreferrer">
                {player.license.label}
              </a>
              {player.transitional ? " · 过渡图" : ""}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}
