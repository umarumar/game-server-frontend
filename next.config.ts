import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served as a multi-zone under muhammadumarali.com/game-server — the
  // portfolio app rewrites /game-server/* to this deployment. basePath keeps
  // routes and assets namespaced so the two zones never collide.
  basePath: "/game-server",
  // Next 16 blocks cross-origin access to dev resources (JS chunks, HMR) by
  // default. Allow the LAN IP so the app is usable from other devices (phone)
  // during development. Update this if your machine's IP changes.
  allowedDevOrigins: ["192.168.18.129"],
};

export default nextConfig;
