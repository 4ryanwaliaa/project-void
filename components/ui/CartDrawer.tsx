"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useVoid } from "@/lib/store";
import { formatPrice } from "@/lib/products";
import { loadRazorpay } from "@/lib/checkout";
import PosterArt from "@/components/frames/PosterArt";

type Status = "idle" | "processing" | "paid" | "failed";

export default function CartDrawer() {
  const open = useVoid((s) => s.cartOpen);
  const setOpen = useVoid((s) => s.setCartOpen);
  const cart = useVoid((s) => s.cart);
  const changeQty = useVoid((s) => s.changeQty);
  const removeFromCart = useVoid((s) => s.removeFromCart);
  const clearCart = useVoid((s) => s.clearCart);
  const total = useVoid((s) => s.cartTotal());
  const count = useVoid((s) => s.cartCount());

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    // reset success state shortly after closing
    setTimeout(() => {
      if (status === "paid") setStatus("idle");
    }, 300);
  };

  // Warm the Razorpay SDK as soon as the cart opens (idle), so clicking PAY
  // doesn't stall while a few hundred KB of checkout script downloads.
  useEffect(() => {
    if (!open) return;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
    };
    if (w.requestIdleCallback) w.requestIdleCallback(() => void loadRazorpay());
    else setTimeout(() => void loadRazorpay(), 200);
  }, [open]);

  // Escape closes the drawer; lock page scroll behind it while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setError("");
    setStatus("processing");

    const ready = await loadRazorpay();
    if (!ready) {
      setStatus("failed");
      setError("Couldn't load the payment SDK — check your connection.");
      return;
    }

    try {
      // Send line items, not an amount — the server prices the order from the
      // canonical catalog so the total can't be tampered with in the browser.
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((l) => ({ id: l.product.id, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.orderId) {
        setStatus("failed");
        setError(data.error || "Could not start checkout.");
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "PROJECT VOID",
        description: `${count} frame${count > 1 ? "s" : ""} — The Collection`,
        theme: { color: "#D1001F" },
        notes: { brand: "PROJECT VOID" },
        handler: async (resp) => {
          const v = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resp),
          });
          const vd = await v.json();
          if (vd.verified) {
            clearCart();
            setStatus("paid");
          } else {
            setStatus("failed");
            setError("Payment could not be verified.");
          }
        },
        modal: {
          ondismiss: () => setStatus((s) => (s === "paid" ? s : "idle")),
        },
      });
      rzp.on("payment.failed", () => {
        setStatus("failed");
        setError("Payment failed or was cancelled.");
      });
      rzp.open();
    } catch {
      setStatus("failed");
      setError("Something went wrong starting checkout.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-void-black/70 backdrop-blur-sm"
            onClick={close}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-void-red/30 bg-void-panel grain"
          >
            <div className="flex items-center justify-between border-b border-void-line px-6 py-5">
              <div>
                <div className="font-mono text-[10px] tracking-[0.4em] text-void-red">
                  PROJECT VOID
                </div>
                <h2 className="font-display text-xl font-bold tracking-[0.25em] text-white">
                  YOUR HAUL
                </h2>
              </div>
              <button
                onClick={close}
                aria-label="Close cart"
                className="grid h-11 w-11 place-items-center border border-void-line text-void-ash transition hover:border-void-red hover:text-white sm:h-9 sm:w-9"
              >
                ✕
              </button>
            </div>

            {/* SUCCESS STATE */}
            {status === "paid" ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="grid h-16 w-16 place-items-center rounded-full border-2 border-void-red text-2xl text-void-red shadow-red-glow"
                >
                  ✓
                </motion.div>
                <h3 className="mt-6 font-display text-2xl font-bold tracking-[0.2em] text-white text-glow">
                  PAYMENT CONFIRMED
                </h3>
                <p className="mt-2 font-mono text-[11px] tracking-widest text-void-ash">
                  YOUR FRAMES ARE INBOUND FROM THE VOID
                </p>
                <button onClick={close} className="void-btn mt-8">
                  DONE
                </button>
              </div>
            ) : (
              <>
                <div className="void-scroll flex-1 overflow-y-auto px-6 py-5">
                  {cart.length === 0 ? (
                    <div className="grid h-full place-items-center text-center">
                      <div>
                        <div className="font-display text-lg tracking-[0.3em] text-void-ash">
                          THE VOID IS EMPTY
                        </div>
                        <p className="mt-2 font-mono text-[11px] tracking-widest text-void-ash/60">
                          RETURN TO THE WALL AND CLAIM A FRAME
                        </p>
                        <Link
                          href="/frames"
                          onClick={close}
                          className="void-btn mt-6 !px-6 !py-2 text-xs"
                        >
                          BROWSE THE COLLECTION
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {cart.map((line) => (
                        <motion.li
                          key={line.product.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex gap-4 border border-void-line bg-black/40 p-3"
                        >
                          <div className="w-16 shrink-0">
                            <PosterArt product={line.product} compact />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="font-display text-sm font-semibold tracking-wide text-white">
                              {line.product.title}
                            </div>
                            <div className="font-mono text-[10px] tracking-widest text-void-ash">
                              {line.product.series}
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center border border-void-line">
                                <button
                                  onClick={() => changeQty(line.product.id, -1)}
                                  aria-label={`Decrease quantity of ${line.product.title}`}
                                  className="px-3 py-2 text-void-ash transition hover:text-white sm:px-2 sm:py-1"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center font-mono text-xs text-white">
                                  {line.qty}
                                </span>
                                <button
                                  onClick={() => changeQty(line.product.id, 1)}
                                  disabled={line.qty >= (line.product.maxQty ?? 99)}
                                  aria-label={`Increase quantity of ${line.product.title}`}
                                  className="px-3 py-2 text-void-ash transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:px-2 sm:py-1"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-mono text-sm text-white">
                                {formatPrice(line.product.price * line.qty)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(line.product.id)}
                            aria-label={`Remove ${line.product.title}`}
                            className="-m-2 self-start p-2 text-void-ash transition hover:text-void-red"
                          >
                            ✕
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-void-line px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tracking-[0.3em] text-void-ash">
                        SUBTOTAL
                      </span>
                      <span className="font-display text-2xl font-bold text-white">
                        {formatPrice(total)}
                      </span>
                    </div>

                    {error && (
                      <p className="mt-3 font-mono text-[10px] tracking-widest text-void-red-bright">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={status === "processing"}
                      className="void-btn mt-4 w-full justify-center disabled:opacity-60"
                    >
                      {status === "processing"
                        ? "OPENING SECURE CHECKOUT…"
                        : `PAY ${formatPrice(total)}`}
                    </button>
                    <p className="mt-3 text-center font-mono text-[9px] tracking-widest text-void-ash/60">
                      SECURED BY RAZORPAY · UPI / CARDS / NETBANKING
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
