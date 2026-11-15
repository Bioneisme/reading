import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./readly-states.css";
import { AccountSync } from "@/components/account/AccountSync";
import { DemoBanner } from "@/components/DemoBanner";

const nunito = localFont({
  variable: "--font-nunito",
  display: "swap",
  src: [{ path: "./fonts/nunito-500-900-latin.woff2", weight: "500 900", style: "normal" }],
});

const andika = localFont({
  variable: "--font-andika",
  display: "swap",
  src: [
    { path: "./fonts/andika-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/andika-700-latin.woff2", weight: "700", style: "normal" },
  ],
});

const title = "Readly — find out why your child guesses words";
const description =
  "A 3-minute reading check for parents of K–2 kids. See which sound patterns trip your child up, then follow a 10-minute plan each night.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://readly.13lab.tech"),
  title: { default: title, template: "%s · Readly" },
  description,
  applicationName: "Readly",
  openGraph: { type: "website", siteName: "Readly", title, description, locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF7F0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${andika.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <AccountSync />
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
