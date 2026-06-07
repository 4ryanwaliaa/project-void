import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

// Display: techno-condensed, carries the cyberpunk-anime HUD voice.
const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Body: neutral, legible on the ecommerce surfaces.
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Mono: HUD codes, prices, system readouts.
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PROJECT VOID — Enter The Void",
  description:
    "A secret collector's room hidden in a cyberpunk anime universe. Premium framed anime art. Enter The Void.",
  metadataBase: new URL("https://projectvoid.example"),
  openGraph: {
    title: "PROJECT VOID",
    description: "Enter The Void. Premium anime decor for the collector class.",
    type: "website",
  },
  icons: { icon: "/brand/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-void-black text-white antialiased">{children}</body>
    </html>
  );
}
