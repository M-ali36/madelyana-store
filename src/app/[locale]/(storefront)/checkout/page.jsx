"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/context/AppContext";
import { db, auth } from "@/lib/firebaseClient";
import {
	doc,
	getDoc,
	setDoc,
	addDoc,
	collection,
	serverTimestamp,
} from "firebase/firestore";
import useCurrency from "@/components/hooks/useCurrency";

export default function CheckoutPage() {
	const router = useRouter();
	const { cart, user, clearCart } = useAppContext();
	const { format } = useCurrency();

	const [address, setAddress] = useState({
		fullName: "",
		phone: "",
		country: "",
		city: "",
		street: "",
		state: "",
		zip: "",
	});

	const [loading, setLoading] = useState(true);
	const [placing, setPlacing] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	// ---------------------------------------------------------
	// LOAD ADDRESS FROM: users/{uid}.address
	// ---------------------------------------------------------
	useEffect(() => {
		if (!user) return;

		const loadAddress = async () => {
			let baseAddress = {
				fullName: user.fullName || "",
				phone: user.phone || "",
				country: "",
				city: "",
				street: "",
				state: "",
				zip: "",
			};

			const ref = doc(db, "users", user.uid);
			const snap = await getDoc(ref);

			if (snap.exists()) {
				const data = snap.data();
				const saved = data.address || {};

				baseAddress = {
					fullName: saved.fullName || baseAddress.fullName,
					phone: saved.phone || baseAddress.phone,
					country: saved.country || "",
					city: saved.city || "",
					street: saved.street || "",
					state: saved.state || "",
					zip: saved.zip || "",
				};
			}

			setAddress(baseAddress);
			setLoading(false);
		};

		loadAddress();
	}, [user]);

	// ---------------------------------------------------------
	// GUARDS
	// ---------------------------------------------------------
	if (!user)
		return <div className="p-6 text-center text-gray-600">Login required.</div>;

	if (loading) return <div className="p-6">Loading checkout…</div>;

	if (cart.length === 0)
		return (
			<div className="p-6 text-center">
				<p>Your cart is empty.</p>
				<button
					className="mt-4 px-4 py-2 bg-black text-white rounded-md"
					onClick={() => router.push("/")}
				>
					Continue Shopping
				</button>
			</div>
		);

	// ---------------------------------------------------------
	// TOTALS
	// ---------------------------------------------------------
	const shippingFee = 0;
	const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
	const total = subtotal + shippingFee;

	// ---------------------------------------------------------
	// ⭐ VALIDATE REQUIRED FIELDS
	// ---------------------------------------------------------
	function validateAddress() {
		if (!address.fullName.trim()) return "Full name is required.";
		if (!address.phone.trim()) return "Phone number is required.";
		if (!address.country.trim()) return "Country is required.";
		if (!address.city.trim()) return "City is required.";
		if (!address.street.trim()) return "Street address is required.";
		if (!address.state.trim()) return "State / Region is required.";

		// ZIP is optional → no validation
		return "";
	}

	// ---------------------------------------------------------
	// ⭐ PLACE ORDER
	// ---------------------------------------------------------
	async function placeOrder() {
		setErrorMsg("");

		const validation = validateAddress();
		if (validation) {
			setErrorMsg(validation);
			return;
		}

		if (placing) return;
		setPlacing(true);

		try {
			// 1) Save updated address
			await setDoc(
				doc(db, "users", user.uid),
				{ address },
				{ merge: true }
			);

			// 2) Build order object
			const orderData = {
				userId: user.uid,
				items: cart.map((item) => ({
					productId: item.id,
					variantId: item.variantId,
					title: item.title,
					image: item.image,
					slug: item.slug,
					qty: item.qty,
					price: item.price,
					variant: item.selectedAttributes || {},
				})),
				subtotal,
				shipping: shippingFee,
				total,
				address,
				paymentMethod: "COD",
				status: "pending",
				stockDeducted: false,
				createdAt: serverTimestamp(),
			};

			// 3) Save order
			const orderRef = await addDoc(collection(db, "orders"), orderData);

			// 4) Clear cart
			await clearCart();
			localStorage.removeItem("cart");

			// 5) Redirect
			router.push(`/checkout/success/${orderRef.id}`);
		} catch (err) {
			console.error("ORDER ERROR:", err);
			setErrorMsg("Could not place order. Please try again.");
		}

		setPlacing(false);
	}

	// ---------------------------------------------------------
	// UI
	// ---------------------------------------------------------
	return (
		<div className="max-w-4xl mx-auto py-10">
			<h1 className="text-3xl font-semibold mb-10">Checkout</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
				<div className="lg:col-span-2 space-y-10">
					{/* Address Section */}
					<section className="p-6 bg-white shadow rounded-md border">
						<h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

						{/* Error Message */}
						{errorMsg && (
							<div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
								{errorMsg}
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Full Name */}
							<input
								required
								type="text"
								value={address.fullName}
								placeholder="Full Name *"
								onChange={(e) =>
									setAddress({ ...address, fullName: e.target.value })
								}
								className="border p-3 rounded-md"
							/>

							{/* Phone */}
							<input
								required
								type="text"
								value={address.phone}
								placeholder="Phone *"
								onChange={(e) =>
									setAddress({ ...address, phone: e.target.value })
								}
								className="border p-3 rounded-md"
							/>

							{/* Country */}
							<input
								required
								type="text"
								value={address.country}
								placeholder="Country *"
								onChange={(e) =>
									setAddress({ ...address, country: e.target.value })
								}
								className="border p-3 rounded-md"
							/>

							{/* City */}
							<input
								required
								type="text"
								value={address.city}
								placeholder="City *"
								onChange={(e) =>
									setAddress({ ...address, city: e.target.value })
								}
								className="border p-3 rounded-md"
							/>

							{/* State */}
							<input
								required
								type="text"
								value={address.state}
								placeholder="State / Region *"
								onChange={(e) =>
									setAddress({ ...address, state: e.target.value })
								}
								className="border p-3 rounded-md"
							/>

							{/* ZIP (Optional) */}
							<input
								type="text"
								value={address.zip}
								placeholder="ZIP / Postal Code (optional)"
								onChange={(e) =>
									setAddress({ ...address, zip: e.target.value })
								}
								className="border p-3 rounded-md"
							/>

							{/* Street Address */}
							<input
								required
								type="text"
								value={address.street}
								placeholder="Street Address *"
								onChange={(e) =>
									setAddress({ ...address, street: e.target.value })
								}
								className="md:col-span-2 border p-3 rounded-md"
							/>
						</div>
					</section>

					{/* Payment Section */}
					<section className="p-6 bg-white shadow rounded-md border">
						<h2 className="text-xl font-semibold mb-4">Payment Method</h2>

						<label className="flex items-center gap-3 cursor-pointer">
							<input type="radio" checked readOnly />
							<span className="text-gray-700 font-medium">Cash on Delivery</span>
						</label>
					</section>
				</div>

				{/* Order Summary */}
				<aside className="p-6 bg-white shadow rounded-md border h-fit">
					<h2 className="text-xl font-semibold mb-4">Order Summary</h2>

					<div className="space-y-3 border-b pb-4 mb-4">
						{cart.map((item) => (
							<div key={item.variantId} className="flex justify-between">
								<span>{item.title} × {item.qty}</span>
								<span>{format(item.price * item.qty)}</span>
							</div>
						))}
					</div>

					<div className="flex justify-between mb-2">
						<span>Subtotal</span>
						<span>{format(subtotal)}</span>
					</div>

					<div className="flex justify-between mb-4">
						<span>Shipping</span>
						<span>{format(shippingFee)}</span>
					</div>

					<div className="flex justify-between border-t pt-4 text-xl font-semibold">
						<span>Total</span>
						<span>{format(total)}</span>
					</div>

					<button
						onClick={placeOrder}
						disabled={placing}
						className={`mt-6 w-full py-3 rounded-md transition ${
							placing ? "bg-gray-400" : "bg-black text-white hover:bg-gray-800"
						}`}
					>
						{placing ? "Placing Order…" : "Place Order"}
					</button>
				</aside>
			</div>
		</div>
	);
}
