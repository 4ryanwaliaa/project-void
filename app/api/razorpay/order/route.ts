import { NextResponse } from "next/server";
import { ALL_PRODUCTS } from "@/lib/products";

// Runs on the Node serverless runtime so the secret key never reaches the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QTY_PER_LINE = 99;

/**
 * Creates a Razorpay order. The client sends cart line items ({id, qty}); we
 * price them against the canonical catalog server-side (never trusting a
 * browser-supplied amount), then return the order id + the PUBLIC key id that
 * Razorpay Checkout needs in the browser.
 */
export async function POST(req: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payments are not configured (missing Razorpay keys)." },
      { status: 500 }
    );
  }

  let items: unknown;
  try {
    const body = await req.json();
    items = body?.items;
  } catch {
    /* fall through to validation */
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // Price the order from the catalog — reject anything we don't recognise.
  let amount = 0; // paise
  for (const line of items as { id?: unknown; qty?: unknown }[]) {
    const product = ALL_PRODUCTS.find((p) => p.id === line?.id);
    const qty = Math.floor(Number(line?.qty));
    const maxQty = Math.min(product?.maxQty ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE);
    if (!product || !Number.isFinite(qty) || qty < 1 || qty > maxQty) {
      return NextResponse.json({ error: "Invalid cart items." }, { status: 400 });
    }
    amount += product.price * 100 * qty;
  }

  // Razorpay minimum is ₹1.00 = 100 paise.
  if (amount < 100) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const rzp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount, // paise
        currency: "INR",
        receipt: `void_${Date.now()}`,
        notes: { brand: "PROJECT VOID" },
      }),
    });

    if (!rzp.ok) {
      const detail = await rzp.text();
      return NextResponse.json(
        { error: "Could not create order.", detail },
        { status: 502 }
      );
    }

    const order = await rzp.json();
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // public key id for the browser checkout
    });
  } catch {
    return NextResponse.json(
      { error: "Payment gateway unreachable." },
      { status: 502 }
    );
  }
}
