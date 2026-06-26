// All network calls to the FastAPI game server live here.
// Components never call fetch() directly — they import these functions.
//
// Auth model: anonymous device-based JWT. The token carries player_id and
// game_id, so protected calls only need the token in the Authorization header —
// never send player_id/game_id explicitly.

import type {
  AuthResponse,
  LeaderboardEntry,
  Metric,
  Period,
  Player,
  ProfileUpdate,
  RankEntry,
  StatEntry,
} from "./types";

const BASE_URL = "http://localhost:8000";

// ---- internal request helper ---------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown; // JSON-serialized if present
  token?: string; // adds Authorization: Bearer <token>
  query?: Record<string, string | number | undefined>;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, query } = opts;

  // Build URL with optional query string (skips undefined values).
  const url = new URL(BASE_URL + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Surface the backend's error text so the test client can show it.
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  }

  // 204/empty bodies -> return null cast to T.
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

// ---- auth (public) --------------------------------------------------------

export function registerPlayer(
  gameSlug: string,
  deviceId: string,
  username: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/players/register", {
    method: "POST",
    body: { game_slug: gameSlug, device_id: deviceId, username },
  });
}

export function loginDevice(
  gameSlug: string,
  deviceId: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/players/login/device", {
    method: "POST",
    body: { game_slug: gameSlug, device_id: deviceId },
  });
}

// ---- profile (protected) --------------------------------------------------

export function getMe(token: string): Promise<Player> {
  return request<Player>("/me", { token });
}

export function updateName(token: string, username: string): Promise<Player> {
  return request<Player>("/me/name", {
    method: "PATCH",
    token,
    body: { username },
  });
}

export function updateProfile(
  token: string,
  profile: ProfileUpdate,
): Promise<Player> {
  return request<Player>("/me/profile", {
    method: "PATCH",
    token,
    body: profile,
  });
}

// ---- scores & leaderboard -------------------------------------------------

export function submitScore(
  token: string,
  metric: Metric,
  value: number,
): Promise<unknown> {
  return request<unknown>("/scores", {
    method: "POST",
    token,
    body: { metric, value },
  });
}

export function getLeaderboard(params: {
  metric: Metric;
  period: Period;
  country_code?: string;
  limit?: number;
}): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>("/leaderboard", {
    query: {
      metric: params.metric,
      period: params.period,
      country_code: params.country_code,
      limit: params.limit,
    },
  });
}

// ---- stats & rank (protected) ---------------------------------------------

export function getStats(token: string): Promise<StatEntry[]> {
  return request<StatEntry[]>("/me/stats", { token });
}

export function getRank(
  token: string,
  period: Period,
): Promise<RankEntry[]> {
  return request<RankEntry[]>("/me/rank", {
    token,
    query: { period },
  });
}
