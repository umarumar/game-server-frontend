"use client";

// Shared chrome for the admin panel (screens B/C/D): a left sidebar nav plus a
// content area, in the amber "admin zone" identity. Each admin page renders its
// own content as `children` inside this wrapper.
//
// It also guards the panel: if the current session isn't an admin, it redirects
// to the /admin login instead of rendering — so protection lives in one place.

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGame } from "@/app/context/GameContext";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/games", label: "Games" },
  { href: "/admin/players", label: "Players" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, setToken, setIsAdmin, setPlayer } = useGame();
  const pathname = usePathname();
  const router = useRouter();

  // Guard: non-admins get bounced to the login screen.
  useEffect(() => {
    if (!isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  // End the admin session (all state is memory-only) and return to login.
  function logout() {
    setToken(null);
    setIsAdmin(false);
    setPlayer(null);
    router.replace("/admin");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card px-3 pt-16 pb-4">
        <div className="mb-6 px-2">
          <span className="text-lg font-semibold text-amber">⚡ Admin</span>
          <p className="mt-0.5 text-xs text-muted">Game server console</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-admin-tint font-medium text-amber"
                    : "text-muted hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-auto rounded-md border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-red-border hover:text-red-text"
        >
          Log out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 px-8 py-12">{children}</main>
    </div>
  );
}
