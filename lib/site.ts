/**
 * Canonical site origin. Set NEXT_PUBLIC_SITE_URL in production (Vercel →
 * Settings → Environment Variables) so OG cards and structured data emit
 * real absolute URLs.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://projectvoid.example";
