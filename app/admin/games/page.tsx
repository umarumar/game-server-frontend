"use client";

// Screen C — Admin games (/admin/games).
// Create games (inline bar) and list/delete them. Player counts are derived
// from /admin/players and only shown when that data is available.

import { useCallback, useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import {
  getAdminGames,
  getAdminPlayers,
  createGame,
  deleteGame,
} from "@/lib/api";
import type { GameRead } from "@/lib/types";
import AdminLayout from "@/components/admin/AdminLayout";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function AdminGamesPage() {
  const { token } = useGame();

  const [games, setGames] = useState<GameRead[]>([]);
  const [counts, setCounts] = useState<Map<number, number>>(new Map());
  const [countsAvailable, setCountsAvailable] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Which game's delete is awaiting a confirm click.
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!token) return;
    getAdminGames(token)
      .then(setGames)
      .catch((e) => setError(msg(e)));
    // Derive player-per-game counts. If this fails, hide the count column.
    getAdminPlayers(token)
      .then((players) => {
        const m = new Map<number, number>();
        for (const p of players) m.set(p.game_id, (m.get(p.game_id) ?? 0) + 1);
        setCounts(m);
        setCountsAvailable(true);
      })
      .catch(() => setCountsAvailable(false));
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate() {
    if (!token || !name || !slug) return;
    setCreating(true);
    setError(null);
    try {
      await createGame(token, name, slug);
      setName("");
      setSlug("");
      refresh();
    } catch (e) {
      setError(msg(e));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(gameSlug: string) {
    // First click arms the confirm; second click on the same row deletes.
    if (confirmSlug !== gameSlug) {
      setConfirmSlug(gameSlug);
      return;
    }
    setError(null);
    try {
      await deleteGame(token!, gameSlug);
      setConfirmSlug(null);
      refresh();
    } catch (e) {
      setError(msg(e));
      setConfirmSlug(null);
    }
  }

  const inputClass =
    "rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-green";

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-semibold text-text">Games</h1>

      {/* Inline create bar */}
      <div className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Game name"
          className={`flex-1 ${inputClass}`}
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug"
          className={`w-40 font-mono ${inputClass}`}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !name || !slug}
          className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-bg disabled:opacity-40"
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </div>

      {/* Games table */}
      <div className="rounded-lg border border-border bg-card p-4">
        {games.length === 0 ? (
          <p className="text-sm text-muted">No games yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Slug</th>
                {countsAvailable && <th className="px-3 py-2">Players</th>}
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => {
                const armed = confirmSlug === g.slug;
                return (
                  <tr key={g.id} className="border-t border-border">
                    <td className="px-3 py-2 text-text">{g.name}</td>
                    <td className="px-3 py-2 font-mono text-muted">{g.slug}</td>
                    {countsAvailable && (
                      <td className="px-3 py-2 font-mono text-muted">
                        {counts.get(g.id) ?? 0}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(g.slug)}
                        onMouseLeave={() => armed && setConfirmSlug(null)}
                        className="rounded-md border border-red-border px-3 py-1 text-xs font-medium text-red-text transition-colors hover:bg-red-border/20"
                      >
                        {armed ? "Confirm?" : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {error && <p className="mt-4 text-xs text-red-text">{error}</p>}
    </AdminLayout>
  );
}
