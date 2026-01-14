"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Input from "../Input";

export default function SystemRulesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [rules, setRules] = useState({
    minimum_allowed_buffer: 20,
    max_delivery_rate: 0.8,
    min_delivery_rate: 0.05,
    enforce_worst_case_pricing: true,
    negative_profit_warning: true,
  });

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "system", "rules"));
      if (snap.exists()) setRules(snap.data());
      setLoading(false);
    }
    load();
  }, []);

  function update(field, value) {
    setRules((p) => ({ ...p, [field]: value }));
  }

  async function save() {
    setSaving(true);
    await setDoc(doc(db, "system", "rules"), {
      ...rules,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
  }

  if (loading) return <p>Loading rules...</p>;

  return (
    <div className="bg-white p-6 shadow rounded space-y-6">
      <h2 className="text-xl font-bold">System Rules</h2>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Minimum Buffer (%)" value={rules.minimum_allowed_buffer} onChange={(v) => update("minimum_allowed_buffer", v)} />
        <Input label="Max Delivery Rate" value={rules.max_delivery_rate} onChange={(v) => update("max_delivery_rate", v)} />
        <Input label="Min Delivery Rate" value={rules.min_delivery_rate} onChange={(v) => update("min_delivery_rate", v)} />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <Toggle
          label="Enforce Worst-Case Pricing"
          checked={rules.enforce_worst_case_pricing}
          onChange={(v) => update("enforce_worst_case_pricing", v)}
        />

        <Toggle
          label="Enable Negative Profit Warning"
          checked={rules.negative_profit_warning}
          onChange={(v) => update("negative_profit_warning", v)}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
      >
        {saving ? "Saving..." : "Save Rules"}
      </button>
    </div>
  );
}

// Toggle Component
function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
