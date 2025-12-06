// app/customer/address/page.jsx
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function AddressPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Address fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");

  const [message, setMessage] = useState("");

  // ---------------------------------------------------------
  // Load existing address from Firestore
  // ---------------------------------------------------------
  useEffect(() => {
    const loadAddress = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const addr = data.address || {};

        setFullName(addr.fullName || data.fullName || "");
        setPhone(addr.phone || data.phone || "");
        setStreet(addr.street || "");
        setCity(addr.city || "");
        setStateName(addr.state || "");
        setCountry(addr.country || "");
        setZip(addr.zip || "");
      }

      setLoading(false);
    };

    loadAddress();
  }, []);

  if (loading) {
    return <div className="text-gray-600">Loading address...</div>;
  }

  // ---------------------------------------------------------
  // Save updated address
  // ---------------------------------------------------------
  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      const ref = doc(db, "users", user.uid);

      await updateDoc(ref, {
        address: {
          fullName,
          phone,
          street,
          city,
          state: stateName,
          country,
          zip,
        },
      });

      setMessage("Address updated successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update address.");
    }

    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Shipping Address
      </h1>

      {message && (
        <div className="mb-4 p-3 rounded-md bg-blue-100 border border-blue-300 text-blue-800 text-sm">
          {message}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* FULL NAME */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* PHONE */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* STREET */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Street Address</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          {/* CITY */}
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* STATE */}
          <div>
            <label className="block text-sm font-medium mb-1">State / Region</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            />
          </div>

          {/* COUNTRY */}
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {/* ZIP */}
          <div>
            <label className="block text-sm font-medium mb-1">ZIP / Postal Code</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Save Address
        </button>
      </div>
    </div>
  );
}
