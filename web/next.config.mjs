/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@discordjs/core',
    '@discordjs/rest',
    '@discordjs/ws',
    'discord-api-types',
    'discord.js',
    'ws'
  ],
  experimental: {
    externalDir: true
  },
  turbopack: {
    root: process.cwd()
  },
  transpilePackages: []
};

export default nextConfig;
