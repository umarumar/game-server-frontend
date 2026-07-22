"use client";

// Screen B — Admin dashboard (/admin/dashboard).
// Three server-stat cards + a recent-players table, inside the admin chrome.

import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { getAdminStats, getAdminPlayers, getGames } from "@/lib/api";
import { formatScore } from "@/lib/utils";
import type { AdminPlayer, GameRead, ServerStats } from "@/lib/types";
import AdminLayout from "@/components/admin/AdminLayout";
import RoleBadge from "@/components/admin/RoleBadge";

const RECENT_LIMIT = 8;

export default function AdminDashboardPage() {
  const { token } = useGame();

  const [stats, setStats] = useState<ServerStats | null>(null);
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [games, setGames] = useState<GameRead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getAdminStats(token)
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    getAdminPlayers(token)
      .then(setPlayers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    getGames()
      .then(setGames)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [token]);

  // Map game_id -> slug so player rows can show a readable game.
  const slugById = new Map(games.map((g) => [g.id, g.slug]));

  const cards = [
    { label: "Games", value: stats?.total_games, color: "text-purple-soft" },
    { label: "Players", value: stats?.total_players, color: "text-green" },
    { label: "Scores", value: stats?.total_scores, color: "text-amber" },
  ];

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-semibold text-text">Dashboard</h1>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-xs tracking-wide text-muted uppercase">
              {c.label}
            </p>
            <p className={`mt-2 font-mono text-3xl font-semibold ${c.color}`}>
              {c.value === undefined ? "—" : formatScore(c.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Recent players */}
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
        Recent players
      </h2>
      <div className="rounded-lg border border-border bg-card p-4">
        {players.length === 0 ? (
          <p className="text-sm text-muted">No players yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Game</th>
                <th className="px-3 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {players.slice(0, RECENT_LIMIT).map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2 text-text">{p.username}</td>
                  <td className="px-3 py-2 font-mono text-muted">
                    {slugById.get(p.game_id) ?? p.game_id}
                  </td>
                  <td className="px-3 py-2">
                    <RoleBadge isAdmin={p.is_admin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {error && <p className="mt-4 text-xs text-red-text">{error}</p>}
    </AdminLayout>
  );
}
