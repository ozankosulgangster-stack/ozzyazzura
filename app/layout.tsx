import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://azzura-murano.ozankosulgangster.chatgpt.site"),
  title: "Azzura — Handmade Murano Glass",
  description: "Handmade Murano glass accessories, shaped in Venice and designed to live with you.",
  openGraph: {
    title: "Azzura — Handmade Murano Glass",
    description: "Objects of light, shaped by hand in Murano, Venezia.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Azzura handmade Murano glass" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Azzura — Handmade Murano Glass",
    description: "Objects of light, shaped by hand in Murano, Venezia.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geist.variable}>{children}</body></html>;
}
