"use client";

// Screen A — Admin login (/admin).
// The only admin route without the sidebar chrome: you can't show the protected
// panel to someone who isn't authenticated yet. A successful /admin/login flips
// isAdmin to true and routes into the panel.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import { adminLogin } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setToken, setIsAdmin } = useGame();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminLogin(username, password);
      // A successful admin login implies an admin account.
      setToken(res.access_token);
      setIsAdmin(true);
      router.push("/admin/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-[380px] flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <span className="self-start rounded-full bg-admin-tint px-3 py-1 text-xs font-medium text-amber">
          Admin access
        </span>

        <div>
          <h1 className="text-xl font-semibold text-text">Admin Console</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in with your admin credentials.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-xs text-muted">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className={inputClass}
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading || !username || !password}
          className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-bg disabled:opacity-40"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {error && <p className="text-xs text-red-text">{error}</p>}
      </div>
    </main>
  );
}
