import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_PRODUCTS, getProduct } from "@/lib/products";
import { SITE_URL } from "@/lib/site";
import ProductDetail from "@/components/frames/ProductDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

// Every product page is pre-rendered at build time; unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const title = `${product.title} — ${product.series}`;
  return {
    title,
    description: product.description,
    openGraph: {
      title: `${product.title} — PROJECT VOID`,
      description: product.description,
      type: "website",
      url: `${SITE_URL}/frames/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — PROJECT VOID`,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  // Google Product rich-result schema — image is the dynamic OG poster.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.id,
    image: [`${SITE_URL}/frames/${product.slug}/opengraph-image`],
    brand: { "@type": "Brand", name: "PROJECT VOID" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/frames/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
