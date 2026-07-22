// Small helpers shared across screens.

// Generate a stable device id (UUID v4) for device-based auth.
// crypto.randomUUID() only exists in a *secure context* (HTTPS or localhost),
// so it's undefined when the app is opened over plain HTTP on a LAN IP (e.g.
// from a phone). Fall back to a getRandomValues-based UUID v4, which works in
// non-secure contexts too.
export function generateDeviceId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // RFC 4122 version 4 UUID from random bytes.
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}

// Format a numeric score with thousands separators, e.g. 1234567 -> "1,234,567".
export function formatScore(value: number): string {
  return value.toLocaleString("en-US");
}

// Shorten long strings (like JWTs) for display: "eyJhbGci…q8w2".
export function truncate(value: string, head = 12, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

// Read the player id (`sub` claim) out of a JWT without verifying it — used
// only to know which admin row is "you" (never for authorization; the server
// re-checks everything). Returns null if the token can't be parsed.
export function getTokenPlayerId(token: string): number | null {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const sub = Number(JSON.parse(atob(padded)).sub);
    return Number.isFinite(sub) ? sub : null;
  } catch {
    return null;
  }
}
