/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  assetPrefix: `https://next-app-lambda.s3.amazonaws.com`,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
