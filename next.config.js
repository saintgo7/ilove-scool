/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'lh3.googleusercontent.com', // Google profile images
      'platform-lookaside.fbsbx.com', // Facebook profile images
      'avatars.githubusercontent.com', // GitHub profile images (if used)
      'ssl.pstatic.net', // Naver profile images
      'k.kakaocdn.net', // Kakao profile images
    ],
  },
  experimental: {
    // Enable if using app directory in the future
    // appDir: true,
  },
}

module.exports = nextConfig