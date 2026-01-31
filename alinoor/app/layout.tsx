import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AliNoor - Thoughtful Writing Platform",
  description: "A place for thoughtful writing. Ideas that matter, stories that stay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
