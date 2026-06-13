"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import type { Product } from "@/lib/products";
import { PRODUCTS, CLOCK_PRODUCT, formatPrice } from "@/lib/products";
import { FRAME_SPECS, CHRONO_SPECS, FIELD_LOGS } from "@/lib/lore";
import { useVoid } from "@/lib/store";
import PosterArt from "./PosterArt";
import CartDrawer from "@/components/ui/CartDrawer";
import VoidLogo from "@/components/ui/VoidLogo";

const TAG_STYLE: Record<Product["tag"], string> = {
  FRAME: "border-void-ash/40 text-void-ash",
  LIMITED: "border-void-red/60 text-void-red",
  VAULT: "border-amber-400/50 text-amber-400",
};

const SCRAMBLE = "█▓▒░<>/\\|=+#01";

/** Text that de-scrambles into place, locking in left → right. */
function Decrypt({ text, className }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const DURATION = 900;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const locked = Math.floor(p * text.length);
      let s = text.slice(0, locked);
      for (let i = locked; i < text.length; i++) {
        const c = text[i];
        s += c === " " ? " " : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return <span className={className}>{out}</span>;
}

/** Poster that tilts in 3D toward the pointer with a tracking glare. */
function HoloPoster({ product }: { product: Product }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(35);
  const srx = useSpring(rx, { stiffness: 160, damping: 18 });
  const sry = useSpring(ry, { stiffness: 160, damping: 18 });
  const transform = useMotionTemplate`perspective(950px) rotateX(${srx}deg) rotateY(${sry}deg)`;
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.13), rgba(255,31,61,0.05) 35%, transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 12);
    gx.set(50 + px * 80);
    gy.set(50 + py * 80);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(35);
  };

  return (
    <div className="relative" style={{ perspective: 950 }}>
      {/* red aura behind the artifact */}
      <div
        className="pointer-events-none absolute -inset-10 opacity-60 blur-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${product.accent}33, transparent 65%)`,
        }}
      />
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ transform }}
        className="group relative border border-void-line bg-void-secondary/40 p-3 shadow-red-glow transition-shadow duration-500 hover:shadow-red-glow-lg sm:p-4"
      >
        <PosterArt product={product} />
        {/* tracking glare */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: glare }}
        />
        {/* HUD corner brackets */}
        <div className="pointer-events-none absolute left-1.5 top-1.5 h-5 w-5 border-l border-t border-void-red/70" />
        <div className="pointer-events-none absolute right-1.5 top-1.5 h-5 w-5 border-r border-t border-void-red/70" />
        <div className="pointer-events-none absolute bottom-1.5 left-1.5 h-5 w-5 border-b border-l border-void-red/70" />
        <div className="pointer-events-none absolute bottom-1.5 right-1.5 h-5 w-5 border-b border-r border-void-red/70" />
      </motion.div>
    </div>
  );
}

function MiniCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/frames/${product.slug}`}
      className="group flex flex-col border border-void-line bg-void-secondary/40 transition-colors hover:border-void-red/60"
    >
      <PosterArt product={product} compact />
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <div className="truncate font-display text-xs font-semibold tracking-wide text-white">
            {product.title}
          </div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-void-ash">
            {product.series}
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs text-void-red-bright">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const addToCart = useVoid((s) => s.addToCart);
  const setCartOpen = useVoid((s) => s.setCartOpen);
  const cartCount = useVoid((s) => s.cartCount());
  const inCart = useVoid((s) =>
    s.cart.some((l) => l.product.id === product.id)
  );
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isChrono = product.id === CLOCK_PRODUCT.id;
  const oneOfOne = product.maxQty === 1;
  const specs = isChrono ? CHRONO_SPECS : FRAME_SPECS;
  const log = FIELD_LOGS[product.slug];
  const related = [...PRODUCTS.filter((p) => p.slug !== product.slug)].slice(0, 3);

  const handleAdd = () => {
    if (oneOfOne && inCart) {
      setCartOpen(true);
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };
  const handleBuyNow = () => {
    if (!(oneOfOne && inCart)) addToCart(product);
    setCartOpen(true);
  };

  const share = (kind: "copy" | "wa" | "x") => {
    const url = window.location.href;
    const text = `${product.title} — PROJECT VOID // claim it before it returns to the void`;
    if (kind === "copy") {
      void navigator.clipboard?.writeText(url).then(() => {
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1600);
      });
    } else if (kind === "wa") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
        "_blank",
        "noopener"
      );
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank",
        "noopener"
      );
    }
  };

  const discount =
    product.compareAt != null
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : 0;

  const ctaLabel = oneOfOne
    ? inCart
      ? "SECURED ✓ — VIEW YOUR HAUL"
      : "CLAIM THE 1 OF 1 ›"
    : added
      ? "ADDED TO HAUL ✓"
      : "ADD TO CART";

  return (
    <div className="relative min-h-[100dvh] bg-void-black pb-24 text-white grain sm:pb-0">
      {/* sticky header */}
      <header className="sticky top-0 z-40 border-b border-void-line bg-void-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
          <Link
            href="/frames"
            className="group flex min-h-11 items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-void-ash transition hover:text-white sm:min-h-0"
          >
            <span className="transition-transform group-hover:-translate-x-1">◂</span>
            <span className="hidden sm:inline">THE COLLECTION</span>
            <span className="sm:hidden">BACK</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <VoidLogo size={32} glow={false} />
            <span className="hidden font-display text-sm font-bold tracking-[0.3em] sm:block">
              PROJECT VOID
            </span>
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="flex min-h-11 items-center gap-2 border border-void-red/40 bg-black/40 px-4 py-2 font-mono text-[10px] tracking-widest text-white transition hover:border-void-red hover:bg-void-red/10 sm:min-h-0 sm:px-3"
          >
            CART
            <span className="grid h-4 min-w-4 place-items-center bg-void-red px-1 text-[10px]">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      {/* ambient page glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[44rem] max-w-full -translate-x-1/2 opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${product.accent}55, transparent 70%)`,
        }}
      />

      {/* ------------------------------------------------------------ HERO */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-2 lg:gap-16">
        {/* artifact */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-md lg:sticky lg:top-24 lg:self-start"
        >
          <HoloPoster product={product} />
        </motion.div>

        {/* dossier */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.4em] text-void-red">
              {product.series}
            </span>
            <span
              className={`border bg-black/60 px-2 py-0.5 font-mono text-[9px] tracking-widest ${TAG_STYLE[product.tag]}`}
            >
              {product.tag}
            </span>
            <span className="border border-void-line bg-black/60 px-2 py-0.5 font-mono text-[9px] tracking-widest text-void-ash">
              {product.edition}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            <Decrypt text={product.title} />
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-void-ash">
            {product.description}
          </p>

          {/* price + CTA */}
          <div className="mt-8 border border-void-line bg-black/40 p-5">
            <div className="flex flex-wrap items-end gap-3">
              <span className="font-display text-4xl font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {product.compareAt != null && (
                <>
                  <span className="pb-1 font-mono text-sm text-void-ash line-through">
                    {formatPrice(product.compareAt)}
                  </span>
                  <span className="mb-1 border border-void-red/60 bg-void-red/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-void-red-bright">
                    −{discount}%
                  </span>
                </>
              )}
              {oneOfOne && (
                <span className="mb-1 ml-auto flex items-center gap-1.5 font-mono text-[10px] tracking-[0.25em] text-void-red-bright">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse-red rounded-full bg-void-red" />
                  STOCK: 1
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAdd}
                className={`void-btn flex-1 justify-center text-sm ${
                  added ? "!bg-void-red" : ""
                }`}
              >
                {ctaLabel}
              </button>
              {!oneOfOne && (
                <button
                  onClick={handleBuyNow}
                  className="flex-1 border border-void-line bg-black/40 px-6 py-3 font-display text-sm uppercase tracking-wide text-void-ash transition hover:border-void-red hover:text-white"
                >
                  BUY NOW →
                </button>
              )}
            </div>

            <p className="mt-4 text-center font-mono text-[9px] tracking-[0.25em] text-void-ash/60">
              SECURED BY RAZORPAY · UPI / CARDS / NETBANKING · SHIPS IN 72H
            </p>
          </div>

          {/* spec sheet */}
          <div className="mt-8">
            <div className="font-mono text-[10px] tracking-[0.4em] text-void-red">
              {"// ARTIFACT DOSSIER"}
            </div>
            <dl className="mt-3 divide-y divide-void-line border border-void-line bg-black/30">
              {specs.map((row) => (
                <div
                  key={row.k}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <dt className="w-28 shrink-0 font-mono text-[10px] tracking-[0.3em] text-void-ash">
                    {row.k}
                  </dt>
                  <dd className="font-mono text-[11px] tracking-wider text-white/90">
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* share row */}
          <div className="mt-8">
            <div className="font-mono text-[10px] tracking-[0.4em] text-void-red">
              {"// TRANSMIT THIS SIGNAL"}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => share("copy")}
                className="border border-void-line bg-black/40 px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-void-ash transition hover:border-void-red hover:text-white"
              >
                {copied ? "LINK COPIED ✓" : "COPY LINK"}
              </button>
              <button
                onClick={() => share("wa")}
                className="border border-void-line bg-black/40 px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-void-ash transition hover:border-void-red hover:text-white"
              >
                WHATSAPP
              </button>
              <button
                onClick={() => share("x")}
                className="border border-void-line bg-black/40 px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-void-ash transition hover:border-void-red hover:text-white"
              >
                POST ON X
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------- FIELD LOG */}
      {log && (
        <section className="border-t border-void-line bg-void-panel/40">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-8">
            <div className="font-mono text-[10px] tracking-[0.4em] text-void-red">
              {"// FIELD LOG — RECOVERED TRANSMISSION"}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="mt-5 space-y-5 border-l-2 border-void-red/40 pl-5"
            >
              {log.map((para, i) => (
                <p
                  key={i}
                  className="font-mono text-[12px] leading-relaxed tracking-wide text-white/80 sm:text-sm"
                >
                  {para}
                </p>
              ))}
              <p className="font-mono text-[9px] tracking-[0.3em] text-void-ash/50">
                — ARCHIVE ENTRY {product.id.toUpperCase()} · VERIFIED BY THE VOID
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------- SEE THE ROOM */}
      <section className="border-t border-void-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-8">
          <p className="font-mono text-[10px] tracking-[0.35em] text-void-ash">
            THIS PIECE HANGS IN A ROOM THAT SHOULDN&apos;T EXIST
          </p>
          <Link href="/" className="void-btn">
            SEE IT ON THE WALL ›
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------------- RELATED */}
      <section className="border-t border-void-line">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-bold tracking-[0.2em] text-white sm:text-2xl">
              ALSO ON THE WALL
            </h2>
            <Link
              href="/frames"
              className="font-mono text-[10px] tracking-[0.3em] text-void-ash transition hover:text-white"
            >
              VIEW ALL ›
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-5">
            {related.map((p) => (
              <MiniCard key={p.id} product={p} />
            ))}
          </div>

          {!isChrono && (
            <Link
              href={`/frames/${CLOCK_PRODUCT.slug}`}
              className="group mt-8 flex flex-col items-start justify-between gap-3 border border-void-red/40 bg-void-red/5 px-5 py-4 transition hover:bg-void-red/10 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-void-red">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse-red rounded-full bg-void-red" />
                  THE 1 OF 1
                </div>
                <div className="mt-1 font-display text-lg font-bold tracking-[0.15em] text-white">
                  GEARWORK CHRONO — {formatPrice(CLOCK_PRODUCT.price)}
                </div>
              </div>
              <span className="font-mono text-[10px] tracking-[0.3em] text-void-ash transition group-hover:text-white">
                ONE EXISTS. STILL UNCLAIMED ›
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-void-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 py-10 text-center sm:px-8">
          <VoidLogo size={40} />
          <p className="font-mono text-[9px] tracking-[0.3em] text-void-ash/60">
            © {new Date().getFullYear()} PROJECT VOID — 計画虚空
          </p>
        </div>
      </footer>

      {/* sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-void-red/30 bg-void-black/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div>
          <div className="font-mono text-[8px] tracking-[0.25em] text-void-ash">
            {product.title}
          </div>
          <div className="font-display text-lg font-bold text-white">
            {formatPrice(product.price)}
          </div>
        </div>
        <button onClick={handleAdd} className="void-btn !px-5 !py-2.5 text-xs">
          {oneOfOne ? (inCart ? "SECURED ✓" : "CLAIM IT") : added ? "ADDED ✓" : "ADD TO CART"}
        </button>
      </div>

      <CartDrawer />
    </div>
  );
}
