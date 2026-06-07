"use client";

import type { Product } from "@/lib/products";
import VoidLogo from "@/components/ui/VoidLogo";

interface PosterArtProps {
  product: Product;
  /** Shrinks decorative text for small thumbnails (cart). */
  compact?: boolean;
  className?: string;
}

/**
 * HTML/SVG twin of the 3D canvas poster — crisp, themeable, zero image assets.
 * Used on the gallery cards and cart thumbnails so the art stays identical in spirit
 * to what hangs on the wall in the room.
 */
export default function PosterArt({
  product,
  compact = false,
  className = "",
}: PosterArtProps) {
  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden bg-void-black ${className}`}
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 120%, ${hexA(
          product.accent,
          0.5
        )}, rgba(5,5,5,0) 70%), linear-gradient(180deg, #080709, #120406)`,
      }}
    >
      {/* hazard hatch */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${product.accent} 0 2px, transparent 2px 16px)`,
        }}
      />
      {/* scanlines */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)",
        }}
      />

      {/* sigil */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
        <VoidLogo size={compact ? 56 : 110} glow={!compact} />
      </div>

      {/* kanji */}
      {!compact && (
        <div className="absolute right-3 top-4 font-mono text-lg leading-tight text-white/80">
          虚<br />空
        </div>
      )}

      {/* caption */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        {!compact && (
          <div
            className="font-mono text-[9px] tracking-[0.3em]"
            style={{ color: product.accent }}
          >
            {product.series}
          </div>
        )}
        <div
          className={`font-display font-bold uppercase leading-none text-white ${
            compact ? "text-xs" : "mt-1 text-lg"
          }`}
        >
          {product.title}
        </div>
        {!compact && (
          <div className="mt-1 font-mono text-[8px] tracking-[0.3em] text-void-ash">
            {product.edition}
          </div>
        )}
      </div>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]" />
    </div>
  );
}

function hexA(hex: string, a: number): string {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.repeat(2).slice(0, 6) : c, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
