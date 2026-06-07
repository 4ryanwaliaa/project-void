"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useVoid } from "@/lib/store";
import PosterArt from "./PosterArt";

const TAG_STYLE: Record<Product["tag"], string> = {
  FRAME: "border-void-ash/40 text-void-ash",
  LIMITED: "border-void-red/60 text-void-red",
  VAULT: "border-amber-400/50 text-amber-400",
};

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useVoid((s) => s.addToCart);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col border border-void-line bg-void-secondary/40 transition-colors duration-300 hover:border-void-red/60"
    >
      {/* art */}
      <div className="relative overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <PosterArt product={product} />
        </motion.div>
        <span
          className={`absolute left-3 top-3 border bg-black/60 px-2 py-0.5 font-mono text-[9px] tracking-widest backdrop-blur ${TAG_STYLE[product.tag]}`}
        >
          {product.tag}
        </span>
        {/* hover glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 shadow-red-glow-lg transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="font-mono text-[10px] tracking-[0.3em] text-void-red">
          {product.series}
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold leading-tight tracking-wide text-white">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-void-ash">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-void-line pt-4">
          <span className="font-display text-xl font-bold text-white">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            className={`relative overflow-hidden border px-4 py-2 font-mono text-[11px] tracking-widest transition-all duration-300 ${
              added
                ? "border-void-red bg-void-red text-white"
                : "border-void-red/60 text-white hover:bg-void-red/15"
            }`}
          >
            {added ? "ADDED ✓" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
