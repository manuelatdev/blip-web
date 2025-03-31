import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http", // MinIO local
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "**",
      },
      {
        protocol: "https", // Para pruebas con example.com
        hostname: "example.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https", // Para imágenes de imgur (usadas en tus pruebas)
        hostname: "i.imgur.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
