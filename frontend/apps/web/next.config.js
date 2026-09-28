/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/v3/api-docs/:path*",
        destination: `${backendUrl}/v3/api-docs/:path*`,
      },
      {
        source: "/swagger-ui/:path*",
        destination: `${backendUrl}/swagger-ui/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
