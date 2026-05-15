import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { MarketplaceShell } from "@/components/marketplace-shell";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RaithuBridge — Farm products from trusted farmers and sellers",
    template: "%s — RaithuBridge",
  },
  description:
    "Buy farm products directly from trusted farmers and sellers. Browse products, submit listings, and track review status.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MarketplaceShell>{children}</MarketplaceShell>
      </body>
    </html>
  );
}
