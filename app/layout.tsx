import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GameProvider } from "./context/GameContext";
import GlobalControls from "@/components/GlobalControls";

// Font definitions.
// next/font downloads & self-hosts these Google fonts at build time (no runtime
// request to Google), and exposes each as a CSS variable. We attach those
// variables to <html> below; globals.css maps --font-geist-sans/mono to the
// Tailwind `font-sans` / `font-mono` utilities.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Page metadata.
// Next reads this exported `metadata` object and renders the corresponding tags
// into <head>. `title` sets the browser tab / window title; `description` sets
// the meta description used by search engines and link previews.
export const metadata: Metadata = {
  title: "Game Server Test Client",
  description: "Visual test client for the FastAPI game server backend",
};

// Root layout.
// Wraps every page in the app: sets the <html>/<body> shell, applies the fonts
// and dark theme, and mounts GameProvider (global state) + the Home button so
// they persist across all routes. `children` is the current page.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text">
        <GameProvider>
          {/* Global top-left controls (Home + conditional Admin link) */}
          <GlobalControls />
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
