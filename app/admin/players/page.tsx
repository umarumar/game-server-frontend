"use client";

// Screen D — Admin players (/admin/players).
// Filter players by game, promote non-admins to admin, and delete players.

import { Fragment, useCallback, useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import {
  getGames,
  getAdminPlayers,
  getPlayerScores,
  makeAdmin,
  revokeAdmin,
  deletePlayer,
} from "@/lib/api";
import { getTokenPlayerId, formatScore } from "@/lib/utils";
import type { AdminPlayer, GameRead, ScoreResult } from "@/lib/types";
import AdminLayout from "@/components/admin/AdminLayout";
import RoleBadge from "@/components/admin/RoleBadge";

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function AdminPlayersPage() {
  const { token } = useGame();

  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [games, setGames] = useState<GameRead[]>([]);
  const [filter, setFilter] = useState(""); // "" = all games
  const [error, setError] = useState<string | null>(null);

  // Which player's delete is awaiting a confirm click.
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Which player is being promoted, plus the password being entered for them.
  const [promoteId, setPromoteId] = useState<number | null>(null);
  const [promotePassword, setPromotePassword] = useState("");

  // Which admin's revoke is awaiting a confirm click.
  const [revokeId, setRevokeId] = useState<number | null>(null);

  // The logged-in admin's own id — so we never offer to revoke ourselves.
  const currentAdminId = token ? getTokenPlayerId(token) : null;

  // Expandable per-player scores view.
  const [scoresOpenId, setScoresOpenId] = useState<number | null>(null);
  const [scores, setScores] = useState<ScoreResult[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);

  // Game list is only needed for the filter dropdown + game_id -> slug mapping.
  useEffect(() => {
    getGames()
      .then(setGames)
      .catch((e) => setError(msg(e)));
  }, []);

  const refresh = useCallback(() => {
    if (!token) return;
    getAdminPlayers(token, filter || undefined)
      .then(setPlayers)
      .catch((e) => setError(msg(e)));
  }, [token, filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const slugById = new Map(games.map((g) => [g.id, g.slug]));
  const nameById = new Map(games.map((g) => [g.id, g.name]));

  function startPromote(id: number) {
    setPromoteId(id);
    setPromotePassword("");
  }

  async function confirmPromote(id: number) {
    // Require a password so we never create another login-less admin.
    if (!promotePassword) return;
    setError(null);
    try {
      await makeAdmin(token!, id, promotePassword);
      setPromoteId(null);
      setPromotePassword("");
      refresh();
    } catch (e) {
      setError(msg(e));
    }
  }

  async function handleRevoke(id: number) {
    // First click arms the confirm; second click on the same row revokes.
    if (revokeId !== id) {
      setRevokeId(id);
      return;
    }
    setError(null);
    try {
      await revokeAdmin(token!, id);
      setRevokeId(null);
      refresh();
    } catch (e) {
      setError(msg(e));
      setRevokeId(null);
    }
  }

  async function toggleScores(id: number) {
    // Clicking the open row collapses it; otherwise load that player's scores.
    if (scoresOpenId === id) {
      setScoresOpenId(null);
      return;
    }
    setScoresOpenId(id);
    setScores([]);
    setScoresLoading(true);
    try {
      setScores(await getPlayerScores(token!, id));
    } catch (e) {
      setError(msg(e));
    } finally {
      setScoresLoading(false);
    }
  }

  async function handleDelete(id: number) {
    // First click arms the confirm; second click on the same row deletes.
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setError(null);
    try {
      await deletePlayer(token!, id);
      setConfirmId(null);
      refresh();
    } catch (e) {
      setError(msg(e));
      setConfirmId(null);
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-semibold text-text">Players</h1>

      {/* Filter by game */}
      <label className="mb-6 flex items-center gap-2 text-xs text-muted">
        Filter by game
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber"
        >
          <option value="">All games</option>
          {games.map((g) => (
            <option key={g.id} value={g.slug}>
              {g.slug}
            </option>
          ))}
        </select>
      </label>

      {/* Players table */}
      <div className="rounded-lg border border-border bg-card p-4">
        {players.length === 0 ? (
          <p className="text-sm text-muted">No players for this filter.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Game</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const armed = confirmId === p.id;
                const revokeArmed = revokeId === p.id;
                const scoresOpen = scoresOpenId === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr className="border-t border-border">
                    <td className="px-3 py-2 text-text">{p.username}</td>
                    <td className="px-3 py-2 font-mono text-muted">
                      {slugById.get(p.game_id) ?? p.game_id}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {p.country_code ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <RoleBadge isAdmin={p.is_admin} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleScores(p.id)}
                          className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-purple-soft hover:text-text"
                        >
                          {scoresOpen ? "Hide" : "Scores"}
                        </button>
                        {!p.is_admin &&
                          (promoteId === p.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="password"
                                value={promotePassword}
                                onChange={(e) =>
                                  setPromotePassword(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" && confirmPromote(p.id)
                                }
                                placeholder="set password"
                                autoFocus
                                className="w-28 rounded-md border border-purple bg-bg px-2 py-1 text-xs text-text outline-none"
                              />
                              <button
                                onClick={() => confirmPromote(p.id)}
                                disabled={!promotePassword}
                                className="rounded-md bg-purple px-2 py-1 text-xs font-semibold text-white disabled:opacity-40"
                              >
                                Set
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startPromote(p.id)}
                              className="rounded-md border border-purple px-3 py-1 text-xs font-medium text-purple-soft transition-colors hover:bg-purple/20"
                            >
                              Promote
                            </button>
                          ))}
                        {p.is_admin && p.id !== currentAdminId && (
                          <button
                            onClick={() => handleRevoke(p.id)}
                            onMouseLeave={() =>
                              revokeArmed && setRevokeId(null)
                            }
                            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-amber hover:text-amber"
                          >
                            {revokeArmed ? "Confirm?" : "Revoke"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          onMouseLeave={() => armed && setConfirmId(null)}
                          className="rounded-md border border-red-border px-3 py-1 text-xs font-medium text-red-text transition-colors hover:bg-red-border/20"
                        >
                          {armed ? "Confirm?" : "Delete"}
                        </button>
                      </div>
                    </td>
                    </tr>
                    {scoresOpen && (
                      <tr className="border-t border-border bg-bg/40">
                        <td colSpan={5} className="px-3 py-3">
                          <p className="mb-2 text-xs text-muted">
                            Game:{" "}
                            <span className="text-text">
                              {nameById.get(p.game_id) ??
                                slugById.get(p.game_id) ??
                                p.game_id}
                            </span>
                          </p>
                          {scoresLoading ? (
                            <p className="text-xs text-muted">Loading scores…</p>
                          ) : scores.length === 0 ? (
                            <p className="text-xs text-muted">
                              No scores for this player.
                            </p>
                          ) : (
                            <table className="w-full border-collapse text-xs">
                              <thead>
                                <tr className="text-left tracking-wide text-muted uppercase">
                                  <th className="px-2 py-1">Metric</th>
                                  <th className="px-2 py-1 text-right">Value</th>
                                  <th className="px-2 py-1">Submitted</th>
                                </tr>
                              </thead>
                              <tbody>
                                {scores.map((s) => (
                                  <tr
                                    key={s.id}
                                    className="border-t border-border"
                                  >
                                    <td className="px-2 py-1 text-text">
                                      {s.metric}
                                    </td>
                                    <td className="px-2 py-1 text-right font-mono text-green">
                                      {formatScore(s.value)}
                                    </td>
                                    <td className="px-2 py-1 font-mono text-muted">
                                      {new Date(s.submitted_at).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
