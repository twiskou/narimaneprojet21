import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Prevent Next.js/Turbopack from bundling these packages at build time.
  // Without this, process.env.TURSO_DATABASE_URL gets statically replaced
  // with its build-time value (undefined) — causing URL_INVALID at runtime.
  // As external packages, they are loaded from node_modules at request time,
  // when process.env is fully populated by Vercel.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-libsql",
    "@libsql/client",
  ],
};

export default nextConfig;