import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifies a completed payment. Razorpay signs `order_id|payment_id` with your
 * key secret (HMAC-SHA256); we recompute it server-side and compare. Never trust
 * the browser's "success" alone — this is the source of truth.
 */
export async function POST(req: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { verified: false, error: "Not configured." },
      { status: 500 }
    );
  }

  let order_id = "";
  let payment_id = "";
  let signature = "";
  try {
    const body = await req.json();
    order_id = body.razorpay_order_id ?? "";
    payment_id = body.razorpay_payment_id ?? "";
    signature = body.razorpay_signature ?? "";
  } catch {
    /* validation below */
  }

  if (!order_id || !payment_id || !signature) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${order_id}|${payment_id}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  const verified = a.length === b.length && crypto.timingSafeEqual(a, b);

  return NextResponse.json(
    { verified, paymentId: verified ? payment_id : undefined },
    { status: verified ? 200 : 400 }
  );
}
