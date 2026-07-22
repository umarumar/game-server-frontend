"use client";

// Fixed top-left controls shown on every screen: the Home button, plus an
// amber "Admin" link that only appears when the session is an admin. Lives in a
// client component because it reads isAdmin from context.

import Link from "next/link";
import { useGame } from "@/app/context/GameContext";

export default function GlobalControls() {
  const { isAdmin } = useGame();

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <Link
        href="/"
        className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted transition-colors hover:border-purple-soft hover:text-text"
      >
        ⌂ Home
      </Link>
      {isAdmin && (
        <Link
          href="/admin/dashboard"
          className="rounded-md border border-amber bg-admin-tint px-3 py-1.5 text-sm font-medium text-amber transition-colors hover:brightness-125"
        >
          Admin
        </Link>
      )}
    </div>
  );
}
