// Small helpers shared across screens.

// Generate a stable device id (UUID v4) for device-based auth.
export function generateDeviceId(): string {
  return crypto.randomUUID();
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
