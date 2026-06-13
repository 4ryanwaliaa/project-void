import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Inter, Space_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
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
  title: {
    default: "PROJECT VOID — Enter The Void",
    template: "%s — PROJECT VOID",
  },
  description:
    "A secret collector's room hidden in a cyberpunk anime universe. Premium framed anime art. Enter The Void.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "PROJECT VOID",
    description: "Enter The Void. Premium anime decor for the collector class.",
    type: "website",
    siteName: "PROJECT VOID",
  },
  icons: {
    icon: "/brand/favicon.svg",
    apple: "/brand/void-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // viewport-fit=cover lets the HUD pad itself around notches/home bars;
  // pinch-zoom stays enabled for accessibility (double-tap zoom is disabled
  // via touch-action in globals.css instead).
  viewportFit: "cover",
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
      <head>
        {/* Warm DNS/TLS to Razorpay so the checkout SDK + API are fast when
            the shopper reaches the PAY button. */}
        <link rel="preconnect" href="https://checkout.razorpay.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.razorpay.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
      </head>
      {/* suppressHydrationWarning: browser extensions inject attributes into
          <body> before React hydrates (e.g. inject_newvt_svd) — only this
          element's attribute mismatches are ignored, children still validate. */}
      <body
        suppressHydrationWarning
        className="bg-void-black text-white antialiased"
      >
        {children}
      </body>
    </html>
  );
}
