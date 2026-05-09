import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
    return [
      {
        source: "/mentor/performance/:path*",
        destination: "/tutor/performance/:path*",
        permanent: false,
      },
      {
        source: "/mentor/courses/:path*",
        destination: "/tutor/courses/:path*",
        permanent: false,
      },
      {
        source: "/mentor/assignments/:path*",
        destination: "/tutor/assignments/:path*",
        permanent: false,
      },
      {
        source: "/mentor/communication/:path*",
        destination: "/tutor/communication/:path*",
        permanent: false,
      },
      {
        source: "/mentor/students/:path*",
        destination: "/tutor/students/:path*",
        permanent: false,
      },
      {
        source: "/mentor/chats/:path*",
        destination: "/tutor/chats/:path*",
        permanent: false,
      },
      {
        source: "/mentor/meetings/mentor/:path*",
        destination: "/tutor/meetings/mentor/:path*",
        permanent: false,
      },
      { source: "/mentor", destination: "/tutor", permanent: false },
    ];
  },
  /** Legacy course-studio fetches; handlers live under /api/tutor/courses */
  async rewrites() {
    return [
      {
        source: "/api/mentor/courses/:path*",
        destination: "/api/tutor/courses/:path*",
      },
    ];
  },
};

export default nextConfig;
