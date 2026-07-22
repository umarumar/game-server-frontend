"use client";

// Dashboard center panel — submit a score (metric + value) via POST /scores.

import { useState } from "react";
import { useGame } from "@/app/context/GameContext";
import { submitScore } from "@/lib/api";
import { METRICS } from "@/lib/constants";
import type { Metric } from "@/lib/types";
import RawResponse from "./RawResponse";

export default function ScoreSubmitter() {
  const { token } = useGame();

  const [metric, setMetric] = useState<Metric>("high-score");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!token || value === "") return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      setResponse(await submitScore(token, metric, Number(value)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-wide text-green uppercase">
        Submit Score
      </h2>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Metric
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as Metric)}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-green"
        >
          {METRICS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Value
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          inputMode="numeric"
          className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-text outline-none focus:border-green"
        />
      </label>

      <button
        onClick={handleSubmit}
        disabled={!token || value === "" || loading}
        className="flex items-center justify-center gap-2 rounded-md bg-green px-4 py-2 text-sm font-semibold text-bg disabled:opacity-40"
      >
        {/* paper-plane send icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        {loading ? "Submitting…" : "Submit"}
      </button>

      <RawResponse data={response} error={error} />
    </section>
  );
}
