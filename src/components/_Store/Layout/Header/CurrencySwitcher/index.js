"use client";

import { useAppContext } from "@/components/context/AppContext";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useAppContext();

  const currencies = [
    { code: "USD", label: "USD", symbol: "$" },
    { code: "AED", label: "UAD", symbol: "د.إ" },
    { code: "EGP", label: "EGP", symbol: "£" },
  ];

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="rounded-md px-3 py-1 text-sm bg-black border-white text-white border cursor-pointer"
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.symbol} - {curr.code}
          </option>
        ))}
      </select>
    </div>
  );
}
