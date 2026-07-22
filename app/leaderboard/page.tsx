"use client";

// Screen 4 — Leaderboard. Three filter groups drive a GET /leaderboard query.
// Requires a token (the backend's leaderboard endpoint is authenticated).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGame } from "../context/GameContext";
import { getLeaderboard } from "@/lib/api";
import { METRICS, PERIODS, COUNTRIES } from "@/lib/constants";
import type { LeaderboardEntry, Metric, Period } from "@/lib/types";
import FilterPills from "@/components/FilterPills";
import LeaderboardTable from "@/components/LeaderboardTable";
import RawResponse from "@/components/RawResponse";

export default function LeaderboardPage() {
  const { token, player } = useGame();

  const [metric, setMetric] = useState<Metric>("high-score");
  const [period, setPeriod] = useState<Period>("all-time");
  const [country, setCountry] = useState(""); // "" = all countries

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Refetch whenever a filter (or token) changes. State updates happen in the
  // async callbacks (not synchronously in the effect body) to satisfy the
  // react-hooks/set-state-in-effect rule.
  useEffect(() => {
    if (!token) return;
    getLeaderboard(token, {
      metric,
      period,
      country_code: country || undefined,
      limit: 50,
    })
      .then((data) => {
        setEntries(data);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [token, metric, period, country]);

  if (!token) {
    return (
      <main className="mx-auto max-w-md px-8 py-16 text-center">
        <p className="text-sm text-muted">
          You need a token first.{" "}
          <Link href="/auth" className="text-purple-soft underline">
            Authenticate →
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-8 py-12">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Leaderboard</h1>
        <Link href="/dashboard" className="text-sm text-purple-soft underline">
          ← Dashboard
        </Link>
      </header>

      {/* Three visually distinct filter groups */}
      <div className="mb-8 flex flex-col gap-5">
        <FilterPills
          label="Metric"
          variant="purple"
          value={metric}
          onChange={(v) => setMetric(v as Metric)}
          options={METRICS.map((m) => ({ value: m, label: m }))}
        />
        <FilterPills
          label="Period"
          variant="teal"
          value={period}
          onChange={(v) => setPeriod(v as Period)}
          options={PERIODS.map((p) => ({ value: p, label: p }))}
        />
        <FilterPills
          label="Country"
          variant="amber"
          value={country}
          onChange={setCountry}
          options={COUNTRIES.map((c) => ({ value: c.code, label: c.label }))}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <LeaderboardTable entries={entries} currentPlayerId={player?.id} />
      </div>

      <RawResponse data={error ? null : entries} error={error} />
    </main>
  );
}
