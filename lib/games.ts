// Hardcoded game list for Screen 1.
// The backend has no "list games" endpoint, so edit these to match the
// game_slug values registered in your FastAPI server. Swapping this for a
// fetch later only touches app/page.tsx.

export interface Game {
  name: string;
  slug: string;
}

export const GAMES: Game[] = [
  { name: "Space Blaster", slug: "space-blaster" },
  { name: "Tower Climb", slug: "tower-climb" },
  { name: "Neon Racer", slug: "neon-racer" },
  { name: "Puzzle Quest", slug: "puzzle-quest" },
];
