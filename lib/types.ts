// Shared types for the game server test client.
// These mirror the FastAPI backend's actual request/response shapes
// (verified against the running backend).

export type Metric = "high-score" | "trophies";

export type Period = "daily" | "weekly" | "monthly" | "yearly" | "all-time";

// Returned by GET /me, PATCH /me/name, PATCH /me/profile.
export interface Player {
  id: number;
  game_id: number;
  username: string;
  email?: string | null;
  profile_image_id: number;
  profile_frame_id: number;
  profile_bg_id: number;
  country_code: string | null;
  created_at?: string;
}

// POST /players/register and /players/login/device — token only (no player).
export interface AuthResponse {
  access_token: string;
  token_type?: string;
  player?: Player;
}

// PATCH /me/profile body — all fields optional.
export interface ProfileUpdate {
  profile_image_id?: number;
  profile_frame_id?: number;
  profile_bg_id?: number;
  country_code?: string;
}

// POST /scores response.
export interface ScoreResult {
  id: number;
  metric: Metric;
  value: number;
  submitted_at: string;
}

// One row from GET /leaderboard. Note: no date field; score lives in `best`.
export interface LeaderboardEntry {
  rank: number;
  player_id: number;
  username: string;
  best: number;
  country_code: string | null;
  profile_image_id?: number;
  profile_frame_id?: number;
  profile_bg_id?: number;
}

// GET /me/stats — best value + submission count per metric.
export interface StatEntry {
  metric: Metric;
  best: number;
  total_submissions: number;
}

// GET /me/rank — wrapper object; rank 0 means unranked (no submissions).
export interface RankEntry {
  metric: Metric;
  rank: number;
  best: number;
  total_players: number;
}

export interface RankResponse {
  period: Period;
  rankings: RankEntry[];
}

// ---- admin ----------------------------------------------------------------

// GET /games (public) and GET /admin/games. created_at only comes from the
// admin variant, so it's optional.
export interface GameRead {
  id: number;
  slug: string;
  name: string;
  created_at?: string;
}

// GET /admin/stats — server-wide totals.
export interface ServerStats {
  total_games: number;
  total_players: number;
  total_scores: number;
  total_admins: number;
}

// One row from GET /admin/players. Note: carries game_id (a number), not a
// slug — map it to a slug via the games list for display.
export interface AdminPlayer {
  id: number;
  game_id: number;
  device_id: string;
  username: string;
  country_code: string | null;
  is_admin: boolean;
  created_at?: string;
}
