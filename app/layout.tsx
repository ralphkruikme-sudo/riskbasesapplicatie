import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "RiskBases",
    template: "%s | RiskBases",
  },
  description: "AI-powered risk management platform for projects.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-icon.png", sizes: "64x64", type: "image/png" },
      { url: "/logo-icon.png", sizes: "128x128", type: "image/png" },
    ],
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/logo-icon.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/logo-icon.png" />
        <link rel="shortcut icon" href="/logo-icon.png" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
