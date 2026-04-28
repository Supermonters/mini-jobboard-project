import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shortlist — a tiny job board",
  description: "A minimal job board for tracking what you've applied to and what fits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}