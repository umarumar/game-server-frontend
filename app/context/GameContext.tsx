"use client";

// Global state shared across all four screens.
// Mounted once in the root layout, so it survives client-side navigation
// (selecting a game on "/" keeps gameSlug/token alive on "/dashboard").

import { createContext, useContext, useState, type ReactNode } from "react";
import { generateDeviceId } from "@/lib/utils";
import type { Player } from "@/lib/types";

const DEVICE_ID_KEY = "gsc.deviceId";

interface GameState {
  // Selected game from Screen 1.
  gameSlug: string | null;
  setGameSlug: (slug: string | null) => void;

  // JWT — kept in memory only, never persisted.
  token: string | null;
  setToken: (token: string | null) => void;

  // Whether the current session is an admin (set at admin login). Memory-only,
  // like the token. Gates the /admin pages and the conditional Admin nav link.
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;

  // Device id — persisted in localStorage so re-login works across refresh.
  deviceId: string;
  regenerateDeviceId: () => void;

  // Current player profile (from /me, register, or login).
  player: Player | null;
  setPlayer: (player: Player | null) => void;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameSlug, setGameSlug] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);

  // Load (or first-time generate) the deviceId from localStorage. Done in a
  // lazy initializer rather than an effect so there's no cascading re-render.
  // On the server there's no localStorage, so it starts "" and resolves on the
  // client's first render. Re-reading getItem before generating keeps this
  // stable under React StrictMode's double-invoke.
  const [deviceId, setDeviceId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    // localStorage access can throw (e.g. iOS Safari private mode). Never let a
    // storage failure crash the app — fall back to an in-memory device id.
    try {
      let stored = localStorage.getItem(DEVICE_ID_KEY);
      if (!stored) {
        stored = generateDeviceId();
        localStorage.setItem(DEVICE_ID_KEY, stored);
      }
      return stored;
    } catch {
      return generateDeviceId();
    }
  });

  function regenerateDeviceId() {
    const next = generateDeviceId();
    try {
      localStorage.setItem(DEVICE_ID_KEY, next);
    } catch {
      // ignore — keep the new id in memory only
    }
    setDeviceId(next);
  }

  return (
    <GameContext.Provider
      value={{
        gameSlug,
        setGameSlug,
        token,
        setToken,
        isAdmin,
        setIsAdmin,
        deviceId,
        regenerateDeviceId,
        player,
        setPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// Convenience hook — throws if used outside the provider.
export function useGame(): GameState {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return ctx;
}
