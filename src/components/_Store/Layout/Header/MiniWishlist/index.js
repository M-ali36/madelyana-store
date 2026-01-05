"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineHeart } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import gsap from "gsap";

export default function MiniWishlist() {
	const { wishlist, setWishlist, cart, setCart, navState, setNavState } =
		useAppContext();

	const locale = useLocale();
	const t = useTranslations("MiniWishlist");

	// ---------------------------
	// HYDRATION CHECK (prevents mismatch)
	// ---------------------------
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		setHydrated(true);
	}, []);

	// Desktop only (no mobile)
	// SSR-safe media query
	const [isDesktop, setIsDesktop] = useState(false);
	useEffect(() => {
		if (typeof matchMedia === "undefined") return;

		const mq = matchMedia("(min-width: 1024px)");
		const update = () => setIsDesktop(mq.matches);

		update();
		mq.addEventListener("change", update);

		return () => mq.removeEventListener("change", update);
	}, []);

	// Toggle wishlist panel
	const toggleWishlist = () => {
		setNavState(navState === "wishlist" ? "" : "wishlist");
	};

	// Remove item from wishlist
	const removeItem = (id) => {
		setWishlist(wishlist.filter((item) => item.id !== id));
	};

	// Add item to cart
	const addToCart = (item) => {
		if (item.hasVariants) {
			window.location.href = `/product/${item.slug}`;
			return;
		}

		const existing = cart.find((c) => c.id === item.id);

		if (existing) {
			setCart(
				cart.map((c) =>
					c.id === item.id
						? { ...c, qty: Math.min(c.qty + 1, c.maxQty || 99) }
						: c
				)
			);
		} else {
			setCart([
				...cart,
				{
					id: item.id,
					title: item.title,
					price: item.price,
					qty: 1,
					maxQty: item.maxQty || 99,
					image: item.image,
					selectedColor: null,
					selectedSize: null,
					variantId: item.id
				}
			]);
		}

		setNavState("");
	};

	// ---------------------------
	// Drawer Refs
	// ---------------------------
	const drawerRef = useRef(null);
	const overlayRef = useRef(null);
	const dir = locale === "ar" ? "rtl" : "ltr";

	// ---------------------------
	// GSAP Animation
	// ---------------------------
	useEffect(() => {
		if (!hydrated) return;
		if (!isDesktop) return; // desktop only
		if (!drawerRef.current || !overlayRef.current) return;

		const drawer = drawerRef.current;
		const overlay = overlayRef.current;

		// detect actual rendered width
		let width = drawer.offsetWidth;
		if (!width) width = 420;

		const fromX = dir === "rtl" ? width : -width;

		if (navState === "wishlist") {
			// OPEN
			gsap.to(overlay, {
				autoAlpha: 1,
				backdropFilter: "blur(6px)",
				duration: 0.3,
				ease: "power2.out"
			});

			gsap.to(drawer, {
				x: 0,
				duration: 0.45,
				ease: "power3.out"
			});
		} else {
			// CLOSE
			gsap.to(drawer, {
				x: fromX,
				duration: 0.45,
				ease: "power3.inOut"
			});

			gsap.to(overlay, {
				autoAlpha: 0,
				backdropFilter: "blur(0px)",
				duration: 0.3
			});
		}
	}, [navState, hydrated, isDesktop, dir]);

	// ---------------------------
	// MAIN RENDER
	// Desktop only wrapper
	// ---------------------------
	if (!hydrated) return null;

	return (
		<div className="relative hidden lg:block">
			{/* HEART ICON */}
			<button className="relative control-btn" onClick={toggleWishlist}>
				<HiOutlineHeart className="w-6 h-6" />

				{wishlist.length > 0 && (
					<span className="absolute -top-2 -right-2 bg-primary text-neutral-900 text-xs w-5 h-5 flex items-center justify-center rounded-full">
						{wishlist.length}
					</span>
				)}
			</button>

			{/* PORTALED DRAWER + OVERLAY (Desktop only) */}
			{isDesktop &&
				createPortal(
					<>
						{/* OVERLAY */}
						<div
							ref={overlayRef}
							onClick={toggleWishlist}
							className="
								fixed inset-0 
								bg-black/30 
								backdrop-blur-sm 
								opacity-0 
								pointer-events-auto 
								z-40
							"
							style={{ visibility: "hidden" }}
						/>

						{/* DRAWER */}
						<div
							ref={drawerRef}
							className={`
								fixed top-0 h-full bg-white shadow-2xl z-50 p-4 overflow-y-auto
								${dir === "rtl" ? "right-0" : "left-0"}
							`}
							style={{
								width: "420px",
                minWidth: "420px",
                maxWidth: "420px",
								transform: "translateX(0)" // SSR safe initial state
							}}
						>
							{/* HEADER */}
							<div className="p-4 flex justify-between items-center border-b">
								<h2 className="text-lg font-semibold">{t("yourWishlist")}</h2>
								<button onClick={toggleWishlist} className="text-gray-500 text-xl">
									✕
								</button>
							</div>

							{/* ITEMS */}
							<div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
								{wishlist.length === 0 && (
									<p className="text-gray-500 text-center">{t("empty")}</p>
								)}

								{wishlist.map((item) => (
									<div key={item.id} className="flex items-start gap-4 border-b pb-3">
										<Image
											src={item.image}
											width={64}
											height={64}
											alt={item.title}
											className="rounded-md"
										/>

										<div className="flex-1">
											<h3 className="text-sm font-medium">{item.title}</h3>

											<p className="text-gray-600 text-xs mt-1">${item.price}</p>

											<button
												onClick={() => addToCart(item)}
												className="mt-2 px-3 py-1 bg-primary text-neutral-900 rounded text-sm w-full"
											>
												{t("addToCart")}
											</button>
										</div>

										<button
											className="text-red-500 text-sm"
											onClick={() => removeItem(item.id)}
										>
											{t("remove")}
										</button>
									</div>
								))}
							</div>

							{/* FOOTER */}
							{wishlist.length > 0 && (
								<div className="p-4 border-t space-y-3">
									<Link
										href="/customer/wishlist"
										locale={locale}
										onClick={() => setNavState("")}
										className="block w-full py-2 text-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition"
									>
										{t("viewWishlist")}
									</Link>
								</div>
							)}
						</div>
					</>,
					document.getElementById("ui-layer")
				)}
		</div>
	);
}
