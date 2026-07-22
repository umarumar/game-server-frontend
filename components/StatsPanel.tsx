"use client";

// Dashboard right panel — bests per metric (GET /me/stats) and rank badges
// per metric for the selected period (GET /me/rank).

import { useEffect, useState } from "react";
import { useGame } from "@/app/context/GameContext";
import { getStats, getRank } from "@/lib/api";
import { PERIODS } from "@/lib/constants";
import { formatScore } from "@/lib/utils";
import type { Period, RankEntry, StatEntry } from "@/lib/types";

export default function StatsPanel() {
  const { token } = useGame();

  const [period, setPeriod] = useState<Period>("all-time");
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [ranks, setRanks] = useState<RankEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Bests don't depend on period — fetch once per token.
  useEffect(() => {
    if (!token) return;
    getStats(token)
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [token]);

  // Ranks depend on the selected period — refetch when it changes.
  // /me/rank returns a wrapper object; we only keep the rankings array.
  useEffect(() => {
    if (!token) return;
    getRank(token, period)
      .then((res) => setRanks(res.rankings))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [token, period]);

  function rankFor(metric: string): number | undefined {
    return ranks.find((r) => r.metric === metric)?.rank;
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-wide text-amber uppercase">
        Stats &amp; Rank
      </h2>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Period
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber"
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        {stats.length === 0 && (
          <span className="text-xs text-muted">No stats yet.</span>
        )}
        {stats.map((s) => {
          const rank = rankFor(s.metric);
          return (
            <div
              key={s.metric}
              className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm text-text">{s.metric}</span>
                <span className="text-xs text-muted">
                  {s.total_submissions} submissions
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm text-green">
                  {formatScore(s.best)}
                </span>
                {rank !== undefined && rank > 0 && (
                  <span className="rounded-full bg-amber/20 px-2 py-0.5 font-mono text-xs text-amber">
                    #{rank}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <span className="text-xs text-amber">{error}</span>}
    </section>
  );
}
