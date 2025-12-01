"use client";

import { useAppContext } from "@/components/context/AppContext";
import { Fragment } from "react";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useAppContext();

  const currencies = [
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
    { code: "EGP", label: "Egyptian Pound", symbol: "£" },
  ];

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white cursor-pointer"
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.symbol} — {curr.code}
          </option>
        ))}
      </select>
    </div>
  );
}
