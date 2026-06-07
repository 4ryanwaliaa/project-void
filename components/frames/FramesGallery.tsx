"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/lib/products";
import { useVoid } from "@/lib/store";
import ProductCard from "./ProductCard";
import CartDrawer from "@/components/ui/CartDrawer";
import VoidLogo from "@/components/ui/VoidLogo";

export default function FramesGallery() {
  const cartCount = useVoid((s) => s.cartCount());
  const setCartOpen = useVoid((s) => s.setCartOpen);

  return (
    <div className="relative min-h-[100dvh] bg-void-black text-white grain">
      {/* sticky header */}
      <header className="sticky top-0 z-40 border-b border-void-line bg-void-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-void-ash transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ◂
            </span>
            BACK TO THE ROOM
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <VoidLogo size={32} glow={false} />
            <span className="hidden font-display text-sm font-bold tracking-[0.3em] sm:block">
              PROJECT VOID
            </span>
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 border border-void-red/40 bg-black/40 px-3 py-2 font-mono text-[10px] tracking-widest text-white transition hover:border-void-red hover:bg-void-red/10"
          >
            CART
            <span className="grid h-4 min-w-4 place-items-center bg-void-red px-1 text-[10px]">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
        <div
          className="pointer-events-none absolute -top-10 left-1/2 h-64 w-[40rem] max-w-full -translate-x-1/2 opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(209,0,31,0.45), transparent 70%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="font-mono text-[11px] tracking-[0.5em] text-void-red">
            {"// THE FRAMES WALL"}
          </div>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
            THE COLLECTION
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-void-ash">
            Every piece on the wall, pulled into the light. Archival anime art,
            sealed in shadow-box frames, built to glow in the dark. Claim yours
            before it returns to the void.
          </p>
          <div className="mt-6 font-mono text-[11px] tracking-[0.3em] text-void-ash">
            {PRODUCTS.length.toString().padStart(2, "0")} PIECES AVAILABLE
          </div>
        </motion.div>
      </section>

      {/* grid */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-void-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-12 text-center sm:px-8">
          <VoidLogo size={48} />
          <div className="font-display text-lg font-bold tracking-[0.4em]">
            PROJECT VOID
          </div>
          <p className="max-w-md font-mono text-[10px] leading-relaxed tracking-widest text-void-ash">
            計画虚空 — PREMIUM ANIME DECOR FOR THE COLLECTOR CLASS. SHIPPED
            WORLDWIDE FROM THE VOID.
          </p>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
