import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Schrift aus dem TweakCN-Theme: Inter, selbst-gehostet via next/font.
// Die CSS-Variable --font-inter wird in globals.css als erste Stufe der
// --font-sans-Kette referenziert.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flow Board",
  description: "Persoenliches Kanban fuer fokussiertes Projekt-Management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Light Mode ist Default — kein '.dark' am <html>.
  return (
    <html lang="de" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
