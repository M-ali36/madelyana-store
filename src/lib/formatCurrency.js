export function formatCurrency(amount, currency, rates) {
  const converted = amount * rates[currency];

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(converted);
}
