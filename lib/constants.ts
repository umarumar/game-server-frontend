// Enumerations the backend accepts. Shared by the dashboard and leaderboard.

import type { Metric, Period } from "./types";

export const METRICS: Metric[] = ["high-score", "trophies"];

export const PERIODS: Period[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "all-time",
];

// Country filter options for the leaderboard. Empty code = no filter (All).
// Edit/extend to match the country_code values your players use.
export interface Country {
  code: string;
  label: string;
}

export const COUNTRIES: Country[] = [
  { code: "", label: "🌍 All" },
  { code: "US", label: "🇺🇸 US" },
  { code: "GB", label: "🇬🇧 GB" },
  { code: "JP", label: "🇯🇵 JP" },
  { code: "DE", label: "🇩🇪 DE" },
  { code: "FR", label: "🇫🇷 FR" },
  { code: "BR", label: "🇧🇷 BR" },
  { code: "IN", label: "🇮🇳 IN" },
];
