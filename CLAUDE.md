# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js version

This project uses **Next.js 16.2.9** with **React 19.2** and **Tailwind CSS v4**. These are newer than most training data and contain breaking changes in APIs, conventions, and file structure. Before writing or modifying any Next.js / React / Tailwind code, read the relevant guide under `node_modules/next/dist/docs/` (e.g. `01-app/`) and honor any deprecation notices. Do not assume older patterns still apply.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint (eslint-config-next: core-web-vitals + typescript)
```

There is no test runner configured yet.

## Architecture

- **App Router** (`app/`): `layout.tsx` is the root layout (loads Geist fonts via `next/font/google`, sets global html/body classes); `page.tsx` is the route. Styling is Tailwind v4 imported through `app/globals.css`.
- **Tailwind v4** is configured via PostCSS (`postcss.config.mjs` → `@tailwindcss/postcss`) — there is no `tailwind.config` file; configuration lives in CSS.
- **Path alias**: `@/*` maps to the repo root (`tsconfig.json`).
- TypeScript is `strict`; the project is currently a fresh `create-next-app` scaffold ("game server frontend") with no domain logic yet.
