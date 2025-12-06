export function orderConfirmationEmail({ orderId, items, subtotal, shipping, total, address }) {
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 8px 0; font-size: 14px;">
        <strong>${item.title}</strong><br />
        ${
          item.variant?.color || item.variant?.size
            ? `<span style="color:#555;">${Object.entries(item.variant)
               .filter(([k,v]) => v != null)
               .map(([k,v]) => `${k}: ${v}`)
               .join(" • ")}</span><br/>`
            : ""
        }
        Quantity: ${item.qty}
      </td>
      <td style="padding: 8px 0; text-align: right; font-size: 14px;">
        ${item.price * item.qty} USD
      </td>
    </tr>
  `).join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
  <body style="margin:0; padding:0; background:#f7f7f7; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:20px;">
            
            <!-- HEADER -->
            <tr>
              <td style="text-align:center; padding-bottom:20px;">
                <h1 style="margin:0; font-size:24px; color:#000;">Madelyana Store</h1>
                <p style="margin:6px 0 0; font-size:14px; color:#444;">
                  Thank you for shopping with us!
                </p>
              </td>
            </tr>

            <!-- ORDER CONFIRMATION MESSAGE -->
            <tr>
              <td style="padding: 10px 0;">
                <h2 style="font-size:18px; margin:0;">Order Confirmed</h2>
                <p style="font-size:14px; color:#555; margin:6px 0 0;">
                  Your order <strong>#${orderId}</strong> has been placed successfully.
                </p>
              </td>
            </tr>

            <!-- ORDER ITEMS -->
            <tr>
              <td style="padding-top: 20px;">
                <h3 style="font-size:16px; margin-bottom:10px;">Items</h3>

                <table width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHTML}
                </table>
              </td>
            </tr>

            <!-- TOTALS -->
            <tr>
              <td style="padding-top: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">

                  <tr>
                    <td style="color:#555;">Subtotal:</td>
                    <td style="text-align:right;">${subtotal} USD</td>
                  </tr>

                  <tr>
                    <td style="color:#555;">Shipping:</td>
                    <td style="text-align:right;">${shipping} USD</td>
                  </tr>

                  <tr>
                    <td style="padding-top:10px; font-size:16px;"><strong>Total:</strong></td>
                    <td style="padding-top:10px; text-align:right; font-size:16px;"><strong>${total} USD</strong></td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- SHIPPING ADDRESS -->
            <tr>
              <td style="padding-top: 25px;">
                <h3 style="font-size:16px; margin-bottom:6px;">Shipping Address</h3>
                <p style="font-size:14px; color:#555; margin:0;">
                  ${address.fullName}<br/>
                  ${address.phone}<br/>
                  ${address.street}<br/>
                  ${address.city}, ${address.country}
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding-top:30px; text-align:center; font-size:12px; color:#999;">
                Madelyana Store © ${new Date().getFullYear()}  
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
