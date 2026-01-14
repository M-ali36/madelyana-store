"use client";

import { useState } from "react";
import StaticDataTab from "@/components/_Admin/Pricing/tabs/StaticDataTab";
import SystemRulesTab from "@/components/_Admin/Pricing/tabs/SystemRulesTab";
import SuggestedRatesTab from "@/components/_Admin/Pricing/tabs/SuggestedRatesTab";

export default function SystemAdminPage() {
  const [activeTab, setActiveTab] = useState("static");

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">System Configuration</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <TabButton
          label="Static Data"
          id="static"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <TabButton
          label="System Rules"
          id="rules"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <TabButton
          label="Suggested Rates"
          id="suggested"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Tab Panels */}
      {activeTab === "static" && <StaticDataTab />}
      {activeTab === "rules" && <SystemRulesTab />}
      {activeTab === "suggested" && <SuggestedRatesTab />}
    </div>
  );
}

// -----------------------
// Tab Button Component
// -----------------------
function TabButton({ label, id, activeTab, setActiveTab }) {
  const active = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`pb-2 px-4 font-semibold border-b-2 
        ${
          active
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
    >
      {label}
    </button>
  );
}
