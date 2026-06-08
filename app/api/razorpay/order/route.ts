import { NextResponse } from "next/server";

// Runs on the Node serverless runtime so the secret key never reaches the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Creates a Razorpay order. The client sends the amount (in paise); we authenticate
 * with the server-only key pair and return the order id + the PUBLIC key id that
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

  let amount = 0;
  try {
    const body = await req.json();
    amount = Math.round(Number(body?.amount));
  } catch {
    /* fall through to validation */
  }

  // Razorpay minimum is ₹1.00 = 100 paise.
  if (!Number.isFinite(amount) || amount < 100) {
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
