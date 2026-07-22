"use client";

// Screen 3 — Dashboard. Three side-by-side panels.
// Requires a token; otherwise points back to auth.

import Link from "next/link";
import { useGame } from "../context/GameContext";
import PlayerCard from "@/components/PlayerCard";
import ScoreSubmitter from "@/components/ScoreSubmitter";
import StatsPanel from "@/components/StatsPanel";

export default function DashboardPage() {
  const { token } = useGame();

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
    <main className="mx-auto max-w-6xl px-8 py-12">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
        <Link
          href="/leaderboard"
          className="text-sm text-purple-soft underline"
        >
          Leaderboard →
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PlayerCard />
        <ScoreSubmitter />
        <StatsPanel />
      </div>
    </main>
  );
}
