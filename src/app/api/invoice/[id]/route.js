import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req, { params }) {
  const orderId = params.id;

  // Fetch order
  const snap = await getDoc(doc(db, "orders", orderId));
  if (!snap.exists()) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = snap.data();

  // PDF DOCUMENT
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 800]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 760;

  const write = (text, x = 40, size = 12, b = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: b ? boldFont : font,
    });
    y -= size + 8;
  };

  // HEADER
  write("INVOICE", 40, 26, true);
  write(`Order #${orderId}`, 40, 14);
  write(`Date: ${order.createdAt?.toDate().toLocaleString()}`);

  y -= 10;
  write("STORE NAME", 400, 12, true);
  write("123 Street", 400);
  write("City, Country", 400);
  write("support@store.com", 400);

  // BILLING + SHIPPING
  y -= 20;
  write("Billing Email:", 40, 12, true);
  write(order.userEmail, 40, 12);

  y -= 20;
  write("Shipping:", 40, 12, true);

  const s = order.shipping || {};
  write(`${s.name || ""}`);
  write(`${s.address || ""}`);
  write(`${s.city || ""}, ${s.country || ""} ${s.zip || ""}`);
  write(`Phone: ${s.phone || ""}`);

  // ITEMS
  y -= 20;
  write("Items:", 40, 14, true);

  order.items.forEach((item) => {
    write(`${item.name} (${item.variant.color}/${item.variant.size})`);
    write(`Qty: ${item.quantity} — $${item.price} each`);
    write(`Line Total: $${(item.price * item.quantity).toFixed(2)}`);

    // REFUND BADGE
    if (order.paymentStatus === "Refunded") {
      write("❗ Refunded", 40, 12, true);
    }

    y -= 10;
  });

  // TOTALS
  y -= 20;
  write("Totals", 40, 14, true);
  write(`Subtotal: $${order.total}`);
  write(`Shipping: $${order.shippingCost || 0}`);
  write(`Grand Total: $${order.total}`);

  // REFUND GLOBAL INDICATOR
  if (order.paymentStatus === "Refunded") {
    y -= 30;
    write("⚠️ THIS ORDER HAS BEEN REFUNDED", 40, 14, true);
  }

  const pdfBytes = await pdf.save();

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${orderId}.pdf`,
    },
  });
}
