/** @type {import('next').NextConfig} */
const nextConfig = {
  // Smaller production image for Coolify (avoids export-layer failures)
  output: "standalone",
};

export default nextConfig;
