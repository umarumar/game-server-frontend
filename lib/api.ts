// All network calls to the FastAPI game server live here.
// Components never call fetch() directly — they import these functions.
//
// Auth model: anonymous device-based JWT. The token carries player_id and
// game_id, so protected calls only need the token in the Authorization header —
// never send player_id/game_id explicitly.

import type {
  AdminPlayer,
  AuthResponse,
  GameRead,
  LeaderboardEntry,
  Metric,
  Period,
  Player,
  ProfileUpdate,
  RankResponse,
  ScoreResult,
  ServerStats,
  StatEntry,
} from "./types";

// Resolve the backend host from the page's own hostname so the app works both
// on localhost and when opened from another device (e.g. a phone) over the LAN.
// Opening http://192.168.x.x:3000 on a phone -> backend at http://192.168.x.x:8000.
// const BACKEND_PORT = 8000;
// const BASE_URL =
//   typeof window !== "undefined"
//     ? `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`
//     : `http://localhost:${BACKEND_PORT}`;

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---- internal request helper ---------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
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
): Promise<ScoreResult> {
  return request<ScoreResult>("/scores", {
    method: "POST",
    token,
    body: { metric, value },
  });
}

// Leaderboard requires auth (the backend returns 401 without a token).
export function getLeaderboard(
  token: string,
  params: {
    metric: Metric;
    period: Period;
    country_code?: string;
    limit?: number;
  },
): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>("/leaderboard", {
    token,
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
): Promise<RankResponse> {
  return request<RankResponse>("/me/rank", {
    token,
    query: { period },
  });
}

// ---- games (public) -------------------------------------------------------

export function getGames(): Promise<GameRead[]> {
  return request<GameRead[]>("/games");
}

// ---- admin ----------------------------------------------------------------
// Admin auth is a separate endpoint (username + password), not device login.
// A successful login implies the account is an admin.

export function adminLogin(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/admin/login", {
    method: "POST",
    body: { username, password },
  });
}

export function getAdminStats(token: string): Promise<ServerStats> {
  return request<ServerStats>("/admin/stats", { token });
}

export function getAdminGames(token: string): Promise<GameRead[]> {
  return request<GameRead[]>("/admin/games", { token });
}

export function createGame(
  token: string,
  name: string,
  slug: string,
): Promise<GameRead> {
  return request<GameRead>("/admin/games", {
    method: "POST",
    token,
    body: { name, slug },
  });
}

export function deleteGame(token: string, slug: string): Promise<unknown> {
  return request<unknown>(`/admin/games/${slug}`, {
    method: "DELETE",
    token,
  });
}

export function getAdminPlayers(
  token: string,
  gameSlug?: string,
): Promise<AdminPlayer[]> {
  return request<AdminPlayer[]>("/admin/players", {
    token,
    query: { game_slug: gameSlug },
  });
}

export function getPlayerScores(
  token: string,
  playerId: number,
): Promise<ScoreResult[]> {
  return request<ScoreResult[]>(`/admin/players/${playerId}/scores`, {
    token,
  });
}

export function makeAdmin(
  token: string,
  playerId: number,
  password?: string,
): Promise<AdminPlayer> {
  return request<AdminPlayer>(`/admin/players/${playerId}/make-admin`, {
    method: "PATCH",
    token,
    body: { password },
  });
}

export function revokeAdmin(
  token: string,
  playerId: number,
): Promise<AdminPlayer> {
  return request<AdminPlayer>(`/admin/players/${playerId}/revoke-admin`, {
    method: "PATCH",
    token,
  });
}

export function deletePlayer(
  token: string,
  playerId: number,
): Promise<unknown> {
  return request<unknown>(`/admin/players/${playerId}`, {
    method: "DELETE",
    token,
  });
}
