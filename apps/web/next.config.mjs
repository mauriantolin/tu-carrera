/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  cacheComponents: true,
  reactStrictMode: false
}

export default nextConfig
