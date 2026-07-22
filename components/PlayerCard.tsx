"use client";

// Dashboard left panel — the player profile.
// Loads GET /me on mount, then allows inline PATCH /me/name and /me/profile.

import { useEffect, useState } from "react";
import { useGame } from "@/app/context/GameContext";
import { getMe, updateName, updateProfile } from "@/lib/api";
import type { ProfileUpdate } from "@/lib/types";
import RawResponse from "./RawResponse";

export default function PlayerCard() {
  const { token, player, setPlayer } = useGame();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [imageId, setImageId] = useState("");
  const [frameId, setFrameId] = useState("");
  const [bgId, setBgId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<unknown>(null);

  // Fetch the profile once when we have a token. The setState happens after an
  // await (asynchronously), so it doesn't trip the cascading-render rule.
  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then((p) => {
        setPlayer(p);
        setName(p.username ?? "");
        setCountry(p.country_code ?? "");
        setImageId(p.profile_image_id?.toString() ?? "");
        setFrameId(p.profile_frame_id?.toString() ?? "");
        setBgId(p.profile_bg_id?.toString() ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [token, setPlayer]);

  async function run(action: () => Promise<unknown>) {
    if (!token) return;
    setError(null);
    setResponse(null);
    try {
      setResponse(await action());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function saveName() {
    await run(async () => {
      const p = await updateName(token!, name);
      setPlayer(p);
      return p;
    });
  }

  async function saveProfile() {
    // Only send fields the user filled in; numbers parsed from text inputs.
    const body: ProfileUpdate = {};
    if (country) body.country_code = country;
    if (imageId) body.profile_image_id = Number(imageId);
    if (frameId) body.profile_frame_id = Number(frameId);
    if (bgId) body.profile_bg_id = Number(bgId);
    await run(async () => {
      const p = await updateProfile(token!, body);
      setPlayer(p);
      return p;
    });
  }

  const inputClass =
    "rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-purple";

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-wide text-purple-soft uppercase">
        Player
      </h2>

      {player && (
        <div className="flex flex-col gap-1 text-xs text-muted">
          <span>
            id: <span className="font-mono text-text">{player.id}</span>
          </span>
        </div>
      )}

      {/* Username — inline edit via PATCH /me/name */}
      <label className="flex flex-col gap-1 text-xs text-muted">
        Username
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`flex-1 ${inputClass}`}
          />
          <button
            onClick={saveName}
            disabled={!token || !name}
            className="rounded-md bg-purple px-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </label>

      {/* Profile fields — PATCH /me/profile */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-muted">Profile</span>

        <label className="flex flex-col gap-1 text-xs text-muted">
          Country code
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. US"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Avatar image
            <input
              value={imageId}
              onChange={(e) => setImageId(e.target.value)}
              placeholder="id #"
              inputMode="numeric"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Avatar frame
            <input
              value={frameId}
              onChange={(e) => setFrameId(e.target.value)}
              placeholder="id #"
              inputMode="numeric"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Background
            <input
              value={bgId}
              onChange={(e) => setBgId(e.target.value)}
              placeholder="id #"
              inputMode="numeric"
              className={inputClass}
            />
          </label>
        </div>
        <button
          onClick={saveProfile}
          disabled={!token}
          className="self-start rounded-md bg-purple px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Save profile
        </button>
      </div>

      <RawResponse data={response} error={error} />
    </section>
  );
}
