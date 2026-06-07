/**
 * The catalog. Each product is a framed piece of anime art — the core of the brand.
 * `image` paths are produced by scripts/process-assets.mjs (real crops for the first two,
 * generated brand posters for the rest) so the repo runs with zero external downloads.
 */
export interface Product {
  id: string;
  slug: string;
  title: string;
  series: string;
  price: number;
  image: string;
  accent: string;
  tag: "FRAME" | "LIMITED" | "VAULT";
  edition: string;
  description: string;
}

// Every frame is priced at ₹799 (so the average across the collection is ₹799).
const FRAME_PRICE = 799;

export const PRODUCTS: Product[] = [
  {
    id: "void-001",
    slug: "give-up",
    title: "GIVE UP ON YOUR DREAMS",
    series: "SURVEY CORPS",
    price: FRAME_PRICE,
    image: "/products/p-give-up.png",
    accent: "#3f6b4f",
    tag: "FRAME",
    edition: "OPEN EDITION",
    description:
      "Matte giclée on heavyweight archival stock, sealed in a brushed-black aluminium frame. The piece that started the wall.",
  },
  {
    id: "void-002",
    slug: "baryon",
    title: "BARYON MODE",
    series: "NINE-TAILS",
    price: FRAME_PRICE,
    image: "/products/p-baryon.png",
    accent: "#ff7a18",
    tag: "FRAME",
    edition: "OPEN EDITION",
    description:
      "Ember-lit hero print with a deep-set shadow box frame. Glows under low light — built for the red room.",
  },
  {
    id: "void-003",
    slug: "void-signal",
    title: "VOID SIGNAL",
    series: "PROJECT VOID",
    price: FRAME_PRICE,
    image: "/products/p-void-signal.png",
    accent: "#D1001F",
    tag: "FRAME",
    edition: "OPEN EDITION",
    description:
      "House sigil rendered as a broadcast artifact. Risograph-style red on void black, framed flush.",
  },
  {
    id: "void-004",
    slug: "crimson-ronin",
    title: "CRIMSON RONIN",
    series: "EDO-2099",
    price: FRAME_PRICE,
    image: "/products/p-crimson-ronin.png",
    accent: "#D1001F",
    tag: "LIMITED",
    edition: "EDITION OF 300",
    description:
      "A lone blade against a bleeding sun. Numbered, embossed with the VOID mark, hand-assembled frame.",
  },
  {
    id: "void-005",
    slug: "ghost-protocol",
    title: "GHOST PROTOCOL",
    series: "SECTOR 9",
    price: FRAME_PRICE,
    image: "/products/p-ghost-protocol.png",
    accent: "#8a8a8f",
    tag: "FRAME",
    edition: "OPEN EDITION",
    description:
      "Monochrome cyber-noir study. Thin gunmetal frame, museum non-glare glazing.",
  },
  {
    id: "void-006",
    slug: "neon-requiem",
    title: "NEON REQUIEM",
    series: "AFTERLIFE",
    price: FRAME_PRICE,
    image: "/products/p-neon-requiem.png",
    accent: "#ff1f3d",
    tag: "LIMITED",
    edition: "EDITION OF 150",
    description:
      "Our flagship. Layered foil and spot-gloss over a dusk skyline. The crown of the collection.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
