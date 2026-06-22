/** @type {import('next').NextConfig} */
const nextConfig = {
  // Widget bundle is built separately by esbuild (widget/build.mjs) into public/.
  // Postgres is deferred; the app runs on the in-memory store when DATABASE_URL is unset.
};

export default nextConfig;
