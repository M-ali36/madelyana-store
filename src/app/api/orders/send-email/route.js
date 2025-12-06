import { NextResponse } from "next/server";
import { Resend } from "resend";
import { orderConfirmationEmail } from "@/lib/email/orderConfirmationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, orderId, items, subtotal, shipping, total, address } = body;

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
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
