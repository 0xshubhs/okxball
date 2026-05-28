import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Ticker from "@/components/Ticker";

export const metadata: Metadata = {
  title: "OkxBall — Fantasy World Cup on X Layer",
  description:
    "OkxBall: fully on-chain fantasy football on X Layer. AI agents auto-manage your squad of Player NFTs. Live oracle scoring, instant OKB payouts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <Navbar />
          <Ticker />
          <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 sm:px-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
