"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { useAppContext } from "@/components/context/AppContext";
import { db, auth } from "@/lib/firebaseClient";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";

import useCurrency from "@/components/hooks/useCurrency";
import AuthTabs from "@/components/auth/AuthTabs";
import Seo from "@/components/Seo";

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("checkout");

  const { cart, user, clearCart } = useAppContext();
  const { format } = useCurrency();

  const [address, setAddress] = useState({
    email: "",
    fullName: "",
    phone: "",
    country: "",
    city: "",
    street: "",
    state: "",
    zip: ""
  });

  const [loading, setLoading] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailRegistered, setEmailRegistered] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // -------------------------------------------------------------------
  // LOAD ADDRESS FOR LOGGED-IN USER
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadAddress = async () => {
      let baseAddress = {
        email: user.email || "",
        fullName: user.fullName || "",
        phone: user.phone || "",
        country: "",
        city: "",
        street: "",
        state: "",
        zip: ""
      };

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const saved = snap.data().address || {};
        baseAddress = { ...baseAddress, ...saved };
      }

      setAddress(baseAddress);
      setLoading(false);
    };

    loadAddress();
  }, [user]);

  // -------------------------------------------------------------------
  // CHECK IF EMAIL IS REGISTERED (ONLY FOR GUEST)
  // -------------------------------------------------------------------
  async function handleEmailChange(email) {
    setAddress((prev) => ({ ...prev, email }));
    setEmailRegistered(false);

    if (user || !email || !email.includes("@")) return;

  }

  async function handleEmailCheck(email) {

    setCheckingEmail(true);

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setEmailRegistered(true);
      } else {
        setEmailRegistered(false);
      }
    } catch (err) {
      console.error("Email check error:", err);
    }

    setCheckingEmail(false);
  }

  if (loading)
    return <div className="p-6">{t("loading")}</div>;

  if (cart.length === 0)
    return (
      <div className="p-6 text-center">
        <p>{t("cartEmpty")}</p>
        <button
          className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-md"
          onClick={() => router.push("/")}
        >
          {t("continueShopping")}
        </button>
      </div>
    );

  // -------------------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------------------
  function validateAddress() {
    if (!address.email.trim()) return t("errEmail");
    if (!address.fullName.trim()) return t("errFullName");
    if (!address.phone.trim()) return t("errPhone");
    if (!address.country.trim()) return t("errCountry");
    if (!address.city.trim()) return t("errCity");
    if (!address.street.trim()) return t("errStreet");
    if (!address.state.trim()) return t("errState");
    return "";
  }

  // -------------------------------------------------------------------
  // PLACE ORDER HANDLER
  // -------------------------------------------------------------------
  async function placeOrder() {
    setErrorMsg("");

    const validation = validateAddress();
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    if (emailRegistered && !user) {
      setErrorMsg(t("emailExists"));
      return;
    }

    if (placing) return;
    setPlacing(true);

    try {
      // SAVE ADDRESS FOR LOGGED IN USER ONLY
      if (user) {
        await setDoc(doc(db, "users", user.uid), { address }, { merge: true });
      }

      const orderData = {
        userId: user ? user.uid : null,
        guest: !user,
        guestEmail: !user ? address.email : null,

        items: cart.map((item) => ({
          productId: item.id,
          variantId: item.variantId,
          title: item.title,
          image: item.image,
          slug: item.slug,
          qty: item.qty,
          price: item.price,
          variant: item.selectedAttributes || {}
        })),

        subtotal: cart.reduce((s, i) => s + i.price * i.qty, 0),
        shipping: 0,
        total: cart.reduce((s, i) => s + i.price * i.qty, 0),

        address,
        paymentMethod: "COD",
        status: "pending",
        stockDeducted: false,
        createdAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);

      await clearCart();
      localStorage.removeItem("cart");

      router.push(
        `${locale === "ar" ? "/ar" : ""}/checkout/success/${orderRef.id}`
      );
    } catch (err) {
      console.error("ORDER ERROR:", err);
      setErrorMsg(t("orderError"));
    }

    setPlacing(false);
  }


  // -------------------------------------------------------------------
  // MAIN CHECKOUT UI
  // -------------------------------------------------------------------
  const shippingFee = 0;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + shippingFee;

  return (
    <>
      <Seo title="Checkout"/>
      {(!user && emailRegistered) ?
        <div className="max-w-md mx-auto pt-10 px-4">
          <p className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-4 py-3 rounded-md text-sm font-medium mb-4">
            {t("emailAlreadyHasAccount")}
          </p>

          <AuthTabs redirectTo="/checkout" />

          <button
            className="mt-6 text-sm text-gray-600 underline text-center mx-auto block mb-10 cusror-pointer"
            onClick={() => setEmailRegistered(false)}
          >
            {t("continueAsGuestAnyway")}
          </button>
        </div>
        :
        <div className="max-w-4xl mx-auto py-10 px-4">
          <h1 className="text-3xl font-semibold mb-10">{t("checkoutTitle")}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-10">

              {/* Address Section */}
              <section className="p-6 bg-white shadow rounded-md border">
                <h2 className="text-xl font-semibold mb-4">{t("shippingAddress")}</h2>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                    {errorMsg}
                  </div>
                )}

                {/* EMAIL FIELD FOR GUESTS */}
                {!user && (
                  <div className="mb-4">
                    <input
                      placeholder={t("email")}
                      value={address.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={(e) => handleEmailCheck(e.target.value)}
                      className="border p-3 rounded-md w-full"
                    />

                    {checkingEmail && (
                      <div className="mt-2 text-sm text-gray-600 animate-pulse">
                        {t("checkingEmail")}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder={t("fullName")}
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="border p-3 rounded-md"
                  />

                  <input
                    placeholder={t("phone")}
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="border p-3 rounded-md"
                  />

                  <input
                    placeholder={t("country")}
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="border p-3 rounded-md"
                  />

                  <input
                    placeholder={t("city")}
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="border p-3 rounded-md"
                  />

                  <input
                    placeholder={t("state")}
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="border p-3 rounded-md"
                  />

                  <input
                    placeholder={t("zip")}
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    className="border p-3 rounded-md"
                  />

                  <input
                    placeholder={t("street")}
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="md:col-span-2 border p-3 rounded-md"
                  />
                </div>
              </section>

              {/* Payment Section */}
              <section className="p-6 bg-white shadow rounded-md border">
                <h2 className="text-xl font-semibold mb-4">{t("paymentMethod")}</h2>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" checked readOnly />
                  <span className="text-gray-700 font-medium">{t("cashOnDelivery")}</span>
                </label>
              </section>
            </div>

            {/* ORDER SUMMARY */}
            <aside className="p-6 bg-white shadow rounded-md border h-fit">
              <h2 className="text-xl font-semibold mb-4">{t("orderSummary")}</h2>

              <div className="space-y-3 border-b pb-4 mb-4">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex justify-between">
                    <span>
                      {item.title} × {item.qty}
                    </span>
                    <span>{format(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mb-2">
                <span>{t("subtotal")}</span>
                <span>{format(subtotal)}</span>
              </div>

              <div className="flex justify-between mb-4">
                <span>{t("shipping")}</span>
                <span>{format(shippingFee)}</span>
              </div>

              <div className="flex justify-between border-t pt-4 text-xl font-semibold">
                <span>{t("total")}</span>
                <span>{format(total)}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className={`mt-6 w-full py-3 rounded-md transition ${
                  placing ? "bg-gray-400" : "bg-neutral-900 text-white hover:bg-gray-800"
                }`}
              >
                {placing ? t("placingOrder") : t("placeOrder")}
              </button>
            </aside>
          </div>
        </div>
      }
    </>
  );
}
