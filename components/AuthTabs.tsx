"use client";

// Screen 2 body — Register / Login tabs for device-based auth.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/app/context/GameContext";
import { registerPlayer, loginDevice } from "@/lib/api";
import { truncate } from "@/lib/utils";
import type { AuthResponse } from "@/lib/types";
import RawResponse from "./RawResponse";

type Tab = "register" | "login";

export default function AuthTabs() {
  const router = useRouter();
  const { gameSlug, deviceId, token, setToken, setPlayer } = useGame();

  const [tab, setTab] = useState<Tab>("register");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AuthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!gameSlug) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res =
        tab === "register"
          ? await registerPlayer(gameSlug, deviceId, username)
          : await loginDevice(gameSlug, deviceId);
      setResponse(res);
      setToken(res.access_token);
      setPlayer(res.player ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // No game chosen yet — send them back to Screen 1.
  if (!gameSlug) {
    return (
      <p className="text-sm text-muted">
        No game selected.{" "}
        <button
          onClick={() => router.push("/")}
          className="text-purple-soft underline"
        >
          Pick a game first.
        </button>
      </p>
    );
  }

  const tabClass = (t: Tab) =>
    `flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      tab === t ? "bg-purple text-white" : "bg-card text-muted hover:text-text"
    }`;

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("register")} className={tabClass("register")}>
          Register
        </button>
        <button onClick={() => setTab("login")} className={tabClass("login")}>
          Login
        </button>
      </div>

      {/* Context fields the request will use */}
      <div className="flex flex-col gap-1 text-xs text-muted">
        <span>
          game_slug: <span className="font-mono text-text">{gameSlug}</span>
        </span>
        <span>
          device_id:{" "}
          <span className="font-mono text-text">{deviceId || "…"}</span>
        </span>
      </div>

      {/* Register needs a username; login does not */}
      {tab === "register" && (
        <label className="flex flex-col gap-1 text-sm text-muted">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="player_one"
            className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-purple"
          />
        </label>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || (tab === "register" && !username)}
        className="rounded-md bg-purple px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {loading ? "…" : tab === "register" ? "Register" : "Login"}
      </button>

      {/* Success indicator with truncated JWT */}
      {token && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <span className="text-sm font-medium text-green">✓ JWT received</span>
          <span className="font-mono text-xs break-all text-muted">
            {truncate(token, 16, 8)}
          </span>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-1 self-start rounded-md bg-green px-3 py-1.5 text-sm font-semibold text-bg"
          >
            Go to Dashboard →
          </button>
        </div>
      )}

      <RawResponse data={response} error={error} />
    </div>
  );
}
