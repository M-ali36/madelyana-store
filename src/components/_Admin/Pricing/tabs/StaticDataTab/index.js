"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import Input from "../Input";

export default function StaticDataTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [autoUnits, setAutoUnits] = useState(false); // ⭐ NEW

  const [form, setForm] = useState({
    delivery_rate_min: "",
    delivery_rate_max: "",
    return_rate: "",
    cod_fee_percent: "",
    delivered_shipping_cost: "",
    return_shipping_cost: "",
    safety_buffer_percent: "",
    profit_reminder_percent: "",

    // ⭐ NEW GLOBAL DEFAULT FIELDS
    ads_budget: "",
    units_purchased: "",
  });

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "system", "staticData"));
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          delivery_rate_min: String(data.delivery_rate_min ?? ""),
          delivery_rate_max: String(data.delivery_rate_max ?? ""),
          return_rate: String(data.return_rate ?? ""),
          cod_fee_percent: String(data.cod_fee_percent ?? ""),
          delivered_shipping_cost: String(data.delivered_shipping_cost ?? ""),
          return_shipping_cost: String(data.return_shipping_cost ?? ""),
          safety_buffer_percent: String(data.safety_buffer_percent ?? ""),
          profit_reminder_percent: String(data.profit_reminder_percent ?? ""),

          ads_budget: String(data.ads_budget ?? ""),
          units_purchased: String(data.units_purchased ?? ""),
        });

        // ⭐ If null or missing, assume auto mode was used
        if (data.units_purchased === null || data.units_purchased === undefined) {
          setAutoUnits(true);
        }
      }
      setLoading(false);
    }

    load();
  }, []);

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function save() {
    setSaving(true);

    await setDoc(doc(db, "system", "staticData"), {
      delivery_rate_min: Number(form.delivery_rate_min),
      delivery_rate_max: Number(form.delivery_rate_max),
      return_rate: Number(form.return_rate),
      cod_fee_percent: Number(form.cod_fee_percent),
      delivered_shipping_cost: Number(form.delivered_shipping_cost),
      return_shipping_cost: Number(form.return_shipping_cost),
      safety_buffer_percent: Number(form.safety_buffer_percent),
      profit_reminder_percent: Number(form.profit_reminder_percent),

      ads_budget: Number(form.ads_budget),

      // ⭐ SAVE LOGIC FOR UNITS
      units_purchased: autoUnits ? null : Number(form.units_purchased),

      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    alert("Static data saved.");
  }

  if (loading) return <p>Loading static data...</p>;

  const errors = [];
  if (form.safety_buffer_percent < 20) errors.push("Safety buffer must be >= 20%.");
  if (form.delivery_rate_min >= form.delivery_rate_max)
    errors.push("Delivery min must be less than max.");

  return (
    <div className="space-y-6 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold">Static Data (Global Defaults)</h2>

      {/* Delivery + Returns */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Delivery Rate Min" value={form.delivery_rate_min} onChange={(v) => update("delivery_rate_min", v)} />
        <Input label="Delivery Rate Max" value={form.delivery_rate_max} onChange={(v) => update("delivery_rate_max", v)} />
        <Input label="Return Rate" value={form.return_rate} onChange={(v) => update("return_rate", v)} />
        <Input label="COD Fee (%)" value={form.cod_fee_percent} onChange={(v) => update("cod_fee_percent", v)} />
        <Input label="Delivered Shipping Cost" value={form.delivered_shipping_cost} onChange={(v) => update("delivered_shipping_cost", v)} />
        <Input label="Return Shipping Cost" value={form.return_shipping_cost} onChange={(v) => update("return_shipping_cost", v)} />
        <Input label="Safety Buffer (%)" value={form.safety_buffer_percent} onChange={(v) => update("safety_buffer_percent", v)} />
        <Input label="Profit Reminder (%)" value={form.profit_reminder_percent} onChange={(v) => update("profit_reminder_percent", v)} />
      </div>

      {/* Ads & Inventory */}
      <h3 className="text-lg font-semibold mt-4">Ads & Inventory Defaults</h3>

      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Ads Budget (Default Campaign Spend)"
          value={form.ads_budget}
          onChange={(v) => update("ads_budget", v)}
        />

        {/* ⭐ UNITS PURCHASED WITH AUTO CHECKBOX */}
        <div>
          <label className="block font-medium mb-1">Units Purchased (Default per batch)</label>

          <input
            disabled={autoUnits}
            type="number"
            className={`w-full border p-2 rounded ${autoUnits ? "bg-gray-100" : ""}`}
            value={autoUnits ? "auto" : form.units_purchased}
            onChange={(e) => update("units_purchased", e.target.value)}
          />

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={autoUnits}
              onChange={(e) => setAutoUnits(e.target.checked)}
            />
            Calculate automatically from product quantity
          </label>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {errors.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}

      <button
        disabled={saving || errors.length > 0}
        onClick={save}
        className={`w-full py-3 rounded text-white font-semibold ${
          saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {saving ? "Saving..." : "Save Static Data"}
      </button>
    </div>
  );
}
