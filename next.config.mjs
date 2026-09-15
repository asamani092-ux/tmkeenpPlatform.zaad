/** @type {import('next').NextConfig} */
const nextConfig = {
  // Smaller production image for Coolify (avoids export-layer failures)
  output: "standalone",
  productionBrowserSourceMaps: false,
  // Limit compile workers — Coolify VPSs OOM with parallel webpack/turbopack workers
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
