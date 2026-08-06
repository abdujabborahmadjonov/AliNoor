import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionSync from "@/app/components/SessionSync";

export const metadata: Metadata = {
  title: "AliNoor — a home for thoughtful writing",
  description:
    "Calm, considered essays and stories. Write in the quiet, read in the light.",
};

export const viewport: Viewport = {
  themeColor: "#fafaf7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Apply the persisted theme — or the OS preference if the user hasn't picked
// one — before the body paints, so the page doesn't flash light then dark.
const APPLY_THEME = `
try {
  var t = localStorage.getItem("alinoor_theme");
  var dark = t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) {
    document.documentElement.setAttribute("data-theme", "dark");
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", "#16140f");
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPLY_THEME }} />
      </head>
      <body className="antialiased">
        <SessionSync />
        {children}
      </body>
    </html>
  );
}
