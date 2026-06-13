import { ImageResponse } from "next/og";
import { getProduct, formatPrice } from "@/lib/products";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PROJECT VOID — framed anime art";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Cinematic OG poster generated per product. This is what a shared link
 * renders as on WhatsApp / Discord / X — black void, red signal, the sigil,
 * the artifact's name and price.
 */
export default async function Image({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);

  const title = product?.title ?? "PROJECT VOID";
  const series = product?.series ?? "THE COLLECTION";
  // Satori's bundled font lacks the ₹ glyph — spell out the currency instead.
  const price = product ? formatPrice(product.price).replace("₹", "INR ") : "";
  const edition = product?.edition ?? "";
  const accent = product?.accent ?? "#D1001F";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#050505",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* ambient red glows */}
        <div
          style={{
            position: "absolute",
            left: -160,
            top: 90,
            width: 640,
            height: 640,
            display: "flex",
            background:
              "radial-gradient(circle at center, rgba(209,0,31,0.40) 0%, rgba(209,0,31,0.12) 45%, rgba(209,0,31,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -200,
            width: 560,
            height: 560,
            display: "flex",
            background: `radial-gradient(circle at center, ${accent}33 0%, rgba(0,0,0,0) 65%)`,
          }}
        />
        {/* top + bottom hairlines */}
        <div
          style={{
            position: "absolute",
            top: 38,
            left: 60,
            right: 60,
            height: 2,
            display: "flex",
            background: "rgba(209,0,31,0.55)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 38,
            left: 60,
            right: 60,
            height: 2,
            display: "flex",
            background: "rgba(209,0,31,0.25)",
          }}
        />
        {/* corner brackets */}
        {[
          { left: 28, top: 24, borderLeft: "3px solid", borderTop: "3px solid" },
          { right: 28, top: 24, borderRight: "3px solid", borderTop: "3px solid" },
          { left: 28, bottom: 24, borderLeft: "3px solid", borderBottom: "3px solid" },
          { right: 28, bottom: 24, borderRight: "3px solid", borderBottom: "3px solid" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 44,
              height: 44,
              display: "flex",
              borderColor: "rgba(209,0,31,0.8)",
              ...pos,
            }}
          />
        ))}

        {/* sigil column */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 420,
            height: "100%",
          }}
        >
          <svg width="320" height="320" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#D1001F"
              strokeWidth="2.5"
              strokeOpacity="0.55"
              fill="none"
              strokeDasharray="180 40 180 40"
            />
            <circle
              cx="100"
              cy="100"
              r="92"
              stroke="#D1001F"
              strokeWidth="1"
              strokeOpacity="0.3"
              fill="none"
            />
            <line x1="100" y1="6" x2="100" y2="22" stroke="#D1001F" strokeWidth="3" />
            <line x1="100" y1="178" x2="100" y2="194" stroke="#D1001F" strokeWidth="3" />
            <line x1="6" y1="100" x2="22" y2="100" stroke="#D1001F" strokeWidth="2" strokeOpacity="0.6" />
            <line x1="178" y1="100" x2="194" y2="100" stroke="#D1001F" strokeWidth="2" strokeOpacity="0.6" />
            <path d="M52 52 L80 52 L104 150 L90 150 Z" fill="#D1001F" />
            <path d="M148 52 L120 52 L96 150 L110 150 Z" fill="#D1001F" />
            <path d="M100 120 L106 138 L100 150 L94 138 Z" fill="#ff1f3d" />
          </svg>
        </div>

        {/* text column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingRight: 90,
            paddingLeft: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 12,
              color: "#ff1f3d",
            }}
          >
            {`// ${series}`}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: title.length > 16 ? 72 : 88,
              lineHeight: 1.04,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: 2,
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 26,
              width: 220,
              height: 3,
              background: "linear-gradient(90deg, #D1001F, rgba(209,0,31,0))",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 26,
            }}
          >
            {price ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 44,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {price}
              </div>
            ) : null}
            {edition ? (
              <div
                style={{
                  display: "flex",
                  border: "1.5px solid rgba(255,31,61,0.7)",
                  background: "rgba(209,0,31,0.12)",
                  color: "#ff1f3d",
                  fontSize: 17,
                  letterSpacing: 5,
                  padding: "8px 16px",
                }}
              >
                {edition}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 44,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 10,
                height: 10,
                background: "#D1001F",
                borderRadius: 10,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 19,
                letterSpacing: 9,
                color: "#8a8a8f",
              }}
            >
              PROJECT VOID — ENTER THE VOID
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
