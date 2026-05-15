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
    default: "RaithuBridge — Farm products for bulk buyers",
    template: "%s — RaithuBridge",
  },
  description:
    "Discover farm products from Indian farmers. Browse categories, send bulk inquiries, and list your harvest for review.",
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
