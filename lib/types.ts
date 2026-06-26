// Shared types for the game server test client.
// These mirror the FastAPI backend's request/response shapes.

export type Metric = "high-score" | "trophies";

export type Period = "daily" | "weekly" | "monthly" | "yearly" | "all-time";

// Returned by GET /me, and inside register/login responses.
export interface Player {
  player_id: string;
  game_id: string;
  username: string;
  profile_image_id?: number | null;
  profile_frame_id?: number | null;
  profile_bg_id?: number | null;
  country_code?: string | null;
}

// POST /players/register and /players/login/device return a JWT (+ maybe player).
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

// One row in GET /leaderboard.
export interface LeaderboardEntry {
  rank: number;
  player_id: string;
  username: string;
  value: number;
  country_code?: string | null;
  created_at?: string;
}

// GET /me/stats — best value + submission count per metric.
export interface StatEntry {
  metric: Metric;
  best: number;
  submission_count: number;
}

// GET /me/rank — player's rank for a metric/period.
export interface RankEntry {
  metric: Metric;
  rank: number;
}
