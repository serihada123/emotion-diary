import type { NextConfig } from "next";

// Vercel sets `VERCEL` during its builds. Only hand off build output to the
// Vercel adapter there — on other platforms (e.g. Netlify), Next.js must
// produce its standard build output for that platform's own integration to
// consume, or routing 404s on every page.
const nextConfig: NextConfig = {
  ...(process.env.VERCEL
    ? { adapterPath: require.resolve("@next-community/adapter-vercel") }
    : {}),
};

export default nextConfig;
