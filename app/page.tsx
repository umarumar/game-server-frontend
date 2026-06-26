"use client";

// Screen 1 — Game Select.
// Pick a game -> store its slug in global state -> go to /auth.

import { useRouter } from "next/navigation";
import { useGame } from "./context/GameContext";
import { GAMES } from "@/lib/games";
import GameCard from "@/components/GameCard";

export default function GameSelectPage() {
  const router = useRouter();
  const { gameSlug, setGameSlug } = useGame();

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

      <div className="grid max-h-[70vh] grid-cols-2 gap-4 overflow-y-auto pr-1">
        {GAMES.map((game) => (
          <GameCard
            key={game.slug}
            name={game.name}
            slug={game.slug}
            selected={gameSlug === game.slug}
            onSelect={() => handleSelect(game.slug)}
          />
        ))}
      </div>
    </main>
  );
}
