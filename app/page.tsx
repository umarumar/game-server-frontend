"use client";

// Screen 1 — Game Select.
// Loads the game list from the server (GET /games), then:
// pick a game -> store its slug in global state -> go to /auth.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "./context/GameContext";
import { getGames } from "@/lib/api";
import type { GameRead } from "@/lib/types";
import GameCard from "@/components/GameCard";

export default function GameSelectPage() {
  const router = useRouter();
  const { gameSlug, setGameSlug } = useGame();

  const [games, setGames] = useState<GameRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGames()
      .then((data) => {
        setGames(data);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(slug: string) {
    setGameSlug(slug);
    router.push("/auth");
  }

  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-text">Game Server</h1>
        <p className="mt-1 text-sm text-muted">Select a game to continue</p>
      </header>

      {loading ? (
        <p className="text-center text-sm text-muted">Loading games…</p>
      ) : error ? (
        <p className="text-center text-sm text-red-text">{error}</p>
      ) : games.length === 0 ? (
        <p className="text-center text-sm text-muted">No games available.</p>
      ) : (
        <div className="grid max-h-[70vh] grid-cols-2 gap-4 overflow-y-auto pr-1">
          {games.map((game) => (
            <GameCard
              key={game.slug}
              name={game.name}
              slug={game.slug}
              selected={gameSlug === game.slug}
              onSelect={() => handleSelect(game.slug)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
