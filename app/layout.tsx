import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
export const metadata: Metadata = {
  title: {
    default: "Blip | Comparte tus pensamientos",
    template: "%s | Blip",
  },
  description:
    "Blip es una aplicación minimalista inspirada en Twitter, construida con Next.js para compartir mensajes cortos de forma simple y rápida.",
  applicationName: "Blip",
  authors: [{ name: "Tu Nombre" }],
  keywords: [
    "red social",
    "minimalista",
    "nextjs",
    "react",
    "typescript",
    "mensajes cortos",
  ],
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Blip",
    description:
      "Una alternativa minimalista a Twitter para compartir pensamientos en pocos caracteres.",
    url: "http://localhost:3000",
    siteName: "Blip",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blip - Red social minimalista",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blip",
    description:
      "Una alternativa minimalista a Twitter para compartir pensamientos en pocos caracteres.",
    creator: "@tuusuario",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// Exportación separada para el viewport
export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1.0,
  };
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>{/* Los metadatos básicos ya están en 'metadata' */}</head>
      <body>
        <div className={`${geistSans.variable} antialiased`}>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
