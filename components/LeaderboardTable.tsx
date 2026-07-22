"use client";

// Leaderboard results table. The current player's row is highlighted in purple.
// Note: the backend leaderboard rows carry no date, so there's no date column.

import { formatScore } from "@/lib/utils";
import { COUNTRIES } from "@/lib/constants";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: number;
}

// Map a country_code to its flag label (falls back to the raw code).
function countryLabel(code: string | null): string {
  if (!code) return "—";
  return COUNTRIES.find((c) => c.code === code)?.label ?? code;
}

export default function LeaderboardTable({
  entries,
  currentPlayerId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted">No entries for these filters.</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-left text-xs tracking-wide text-muted uppercase">
          <th className="px-3 py-2">Rank</th>
          <th className="px-3 py-2">Player</th>
          <th className="px-3 py-2 text-right">Score</th>
          <th className="px-3 py-2">Country</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => {
          const isMe = e.player_id === currentPlayerId;
          return (
            <tr
              key={e.player_id}
              className={`border-t border-border ${
                isMe ? "bg-purple/15" : ""
              }`}
            >
              <td className="px-3 py-2 font-mono text-muted">#{e.rank}</td>
              <td className="px-3 py-2">
                <span className={isMe ? "font-semibold text-purple-soft" : "text-text"}>
                  {e.username}
                </span>
                {isMe && (
                  <span className="ml-2 text-xs text-purple-soft">(you)</span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-mono text-green">
                {formatScore(e.best)}
              </td>
              <td className="px-3 py-2">{countryLabel(e.country_code)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
