"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";

export default function SuggestedRatesTab() {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState({
    suggested_delivery_rate: 0,
    suggested_return_rate: 0,
  });

  useEffect(() => {
    async function load() {
      const ordersSnap = await getDocs(collection(db, "orders"));

      let total = 0;
      let delivered = 0;
      let returned = 0;

      ordersSnap.forEach((doc) => {
        const o = doc.data();
        total++;

        if (o.status === "delivered") delivered++;
        if (o.status === "returned") returned++;
      });

      const deliveryRate = delivered / total || 0;
      const returnRate = returned / total || 0;

      setSuggestions({
        suggested_delivery_rate: deliveryRate.toFixed(2),
        suggested_return_rate: returnRate.toFixed(2),
      });

      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p>Calculating suggested rates...</p>;

  return (
    <div className="bg-white p-6 shadow rounded space-y-4">
      <h2 className="text-xl font-bold">Suggested Rates (from Orders)</h2>

      <div className="text-lg">
        <p><strong>Suggested Delivery Rate:</strong> {suggestions.suggested_delivery_rate}</p>
        <p><strong>Suggested Return Rate:</strong> {suggestions.suggested_return_rate}</p>
      </div>

      <p className="text-sm text-gray-600">
        These values are calculated from historical order performance.
        You can apply them manually in the Static Data tab.
      </p>
    </div>
  );
}
