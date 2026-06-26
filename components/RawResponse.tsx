"use client";

// Collapsible raw API response viewer — used after every action since this is
// a test client. Shows either the parsed JSON (success) or an error string.

import { useState } from "react";

interface RawResponseProps {
  // The value returned by an api.ts call (any JSON shape), or null when idle.
  data: unknown;
  // Error message when the call threw.
  error?: string | null;
}

export default function RawResponse({ data, error }: RawResponseProps) {
  const [open, setOpen] = useState(true);

  if (data == null && !error) return null;

  const isError = Boolean(error);
  const body = isError ? error : JSON.stringify(data, null, 2);

  return (
    <div className="mt-4 rounded-lg border border-border bg-bg">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted"
      >
        <span>
          Raw response{" "}
          <span className={isError ? "text-amber" : "text-green"}>
            {isError ? "• error" : "• ok"}
          </span>
        </span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <pre
          className={`max-h-64 overflow-auto border-t border-border px-3 py-2 font-mono text-xs whitespace-pre-wrap ${
            isError ? "text-amber" : "text-text"
          }`}
        >
          {body}
        </pre>
      )}
    </div>
  );
}
