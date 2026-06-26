// Screen 2 — Auth. Thin wrapper; all interactivity lives in AuthTabs.

import AuthTabs from "@/components/AuthTabs";

export default function AuthPage() {
  return (
    <main className="mx-auto max-w-md px-8 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-text">Authenticate</h1>
        <p className="mt-1 text-sm text-muted">
          Device-based login — no passwords.
        </p>
      </header>
      <AuthTabs />
    </main>
  );
}
