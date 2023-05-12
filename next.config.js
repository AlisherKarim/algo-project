/** @type {import('next').NextConfig} */
const version = process.env.BUILD_VERSION
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  assetPrefix: `https://next-app-lambda.s3.us-east-1.amazonaws.com/${version}`,
  images: {
    unoptimized: true,
  },
};
module.exports = nextConfig;