import { NextResponse } from "next/server";
import { Resend } from "resend";
import { orderConfirmationEmail } from "@/lib/email/orderConfirmationEmail";

// ✅ Lazy, env-safe Resend initializer
function getResendClient() {
  const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ Resend not initialized: missing RESEND_API_KEY");
    return null;
  }

  return new Resend(apiKey);
}

export async function POST(req) {
  try {
    const resend = getResendClient();

    if (!resend) {
      return NextResponse.json(
        { ok: false, error: "Email service not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      email,
      orderId,
      items,
      subtotal,
      shipping,
      total,
      address,
    } = body || {};

    // Basic validation
    if (!email || !orderId || !items || !total) {
      return NextResponse.json(
        { ok: false, error: "Missing order email data" },
        { status: 400 }
      );
    }

    const html = orderConfirmationEmail({
      orderId,
      items,
      subtotal,
      shipping,
      total,
      address,
    });

    const send = await resend.emails.send({
      from: "Madelyana Store <no-reply@madelyana.com>",
      to: email,
      subject: `Your Order Confirmation #${orderId}`,
      html,
    });

    return NextResponse.json({ ok: true, send });

  } catch (err) {
    console.error("Email error:", err);

    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
