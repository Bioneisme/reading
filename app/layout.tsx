import type { Metadata, Viewport } from "next";
import { Andika, Figtree, Fraunces } from "next/font/google";
import "./globals.css";

const ui = Figtree({ variable: "--nf-ui", subsets: ["latin"], display: "swap" });
const display = Fraunces({
  variable: "--nf-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});
const reading = Andika({
  variable: "--nf-reading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SoundOut — a reading coach for parents",
  description:
    "Your child reads a short text aloud, you tap the words they miss, and SoundOut tells you what to practice and what to say tomorrow. 10 minutes a night. No microphone, no iPad, no sign-up.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${ui.variable} ${display.variable} ${reading.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
