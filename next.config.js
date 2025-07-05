/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/avatars/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/.proxy/api/:path*",
        destination: "https://moo.augie.gg/api/:path*",
      },
      {
        source: "/.proxy/matsu/:path*",
        destination: "https://matsu-theme.vercel.app/:path*",
      },
    ];
  },
};

export default config;
