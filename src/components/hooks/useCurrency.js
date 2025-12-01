"use client";

import { useAppContext } from "@/components/context/AppContext";
import { formatCurrency } from "@/lib/formatCurrency";

export default function useCurrency() {
  const { currency, currencyRates } = useAppContext();

  const format = (amount) => {
    return formatCurrency(amount, currency, currencyRates);
  };

  return {
    currency,
    currencyRates,
    format,
  };
}
