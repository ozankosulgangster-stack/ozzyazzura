import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ozzyazzura.ca"),
  title: "Azzura — Murano Glass & Italian Leather",
  description: "Handmade Murano glass accessories and Italian leather handbags, shaped by artisans in Venice and Florence.",
  openGraph: {
    title: "Azzura — Murano Glass & Italian Leather",
    description: "Murano glass and Italian leather, shaped by hand in Venice and Florence.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Azzura handmade Murano glass" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Azzura — Murano Glass & Italian Leather",
    description: "Murano glass and Italian leather, shaped by hand in Venice and Florence.",
    images: ["/og.png"],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geist.variable}>{children}</body></html>;
}
