"use client";

import Checkbox from "@/components/Ui/Checkbox";
import useCurrency from "@/components/hooks/useCurrency";
import { useMemo, useRef, useState, useEffect } from "react";
import { RiListSettingsLine } from "react-icons/ri";
import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import gsap from "gsap";

export default function SidebarFilters({ products, filters, setFilters }) {
	// -------------------------------
	// Locale + Utilities
	// -------------------------------
	const { format } = useCurrency();
	const t = useTranslations();
	const locale = useLocale();
	const dir = locale === "ar" ? "rtl" : "ltr";

	// -------------------------------
	// Hydration-safe state
	// -------------------------------
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		setHydrated(true);
	}, []);

	const [isMobile, setIsMobile] = useState(false);

	// SSR-safe media-query setup
	useEffect(() => {
		if (typeof matchMedia === "undefined") return;

		const mq = matchMedia("(max-width: 1024px)");
		const update = () => setIsMobile(mq.matches);

		update();
		mq.addEventListener("change", update);

		return () => mq.removeEventListener("change", update);
	}, []);

	// -------------------------------
	// Drawer Logic
	// -------------------------------
	const [isOpen, setIsOpen] = useState(false);

	const drawerRef = useRef(null);
	const overlayRef = useRef(null);

	const toggleDrawer = () => setIsOpen((v) => !v);

	// -------------------------------
	// GSAP Animation (hydration-safe)
	// -------------------------------
	useEffect(() => {
		if (!hydrated) return; // prevent SSR mismatches
		if (!drawerRef.current || !overlayRef.current) return;
		if (!isMobile) return;

		const drawer = drawerRef.current;
		const overlay = overlayRef.current;

		// Automatically detect drawer width dynamically
		let drawerWidth = drawer.offsetWidth;
		if (!drawerWidth) drawerWidth = 350; // fallback

		const fromX = dir === "rtl" ? drawerWidth : -drawerWidth;

		if (isOpen) {
			// OPEN
			gsap.to(overlay, {
				autoAlpha: 1,
				backdropFilter: "blur(6px)",
				duration: 0.3,
				ease: "power2.out",
			});

			gsap.to(drawer, {
				x: 0,
				duration: 0.45,
				ease: "power3.out",
			});
		} else {
			// CLOSE
			gsap.to(drawer, {
				x: fromX,
				duration: 0.45,
				ease: "power3.inOut",
			});

			gsap.to(overlay, {
				autoAlpha: 0,
				backdropFilter: "blur(0px)",
				duration: 0.3,
			});
		}
	}, [isOpen, isMobile, hydrated, dir]);

	// -------------------------------
	// Filter Logic
	// -------------------------------
	const unique = (key) => [...new Set(products.flatMap((p) => p[key] || []))];

	const toggleValue = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: prev[key].includes(value)
				? prev[key].filter((v) => v !== value)
				: [...prev[key], value],
		}));
	};

	const [minPrice, maxPrice] = useMemo(() => {
		const prices = products.map((p) => Number(p.price)).filter((v) => !isNaN(v));
		return [
			prices.length ? Math.min(...prices) : 0,
			prices.length ? Math.max(...prices) : 0,
		];
	}, [products]);

	const handlePriceChange = (type, value) => {
		value = Number(value);
		setFilters((prev) => {
			let [minVal, maxVal] = prev.price;

			if (type === "min") minVal = Math.min(value, maxVal - 1);
			if (type === "max") maxVal = Math.max(value, minVal + 1);

			return { ...prev, price: [minVal, maxVal] };
		});
	};

	// -------------------------------
	// Shared Filter Content
	// -------------------------------
	const filterContent = (
		<>
			{/* PRICE RANGE */}
			<div className="price-range-slider border border-slate-300 p-6 rounded-lg bg-white">
				<h4 className="mb-3 font-bold">By Price</h4>

				<div className="slider-container relative pt-6 pb-2">
					<div className="slider-track"></div>

					<div
						className="slider-range"
						style={{
							insetInlineStart: `${
								((filters.price[0] - minPrice) / (maxPrice - minPrice)) * 100
							}%`,
							insetInlineEnd: `${
								100 -
								((filters.price[1] - minPrice) / (maxPrice - minPrice)) * 100
							}%`,
						}}
					/>

					<input
						type="range"
						min={minPrice}
						max={maxPrice}
						value={filters.price[0]}
						onChange={(e) => handlePriceChange("min", e.target.value)}
						className="slider-thumb"
					/>

					<input
						type="range"
						min={minPrice}
						max={maxPrice}
						value={filters.price[1]}
						onChange={(e) => handlePriceChange("max", e.target.value)}
						className="slider-thumb"
					/>
				</div>

				<div className="flex items-center gap-3 mt-4">
					<span className="text-sm">From</span>
					<span className="text-xs p-2 border border-slate-200 rounded">
						{format(filters.price[0])}
					</span>

					<span className="text-sm">To</span>
					<span className="text-xs p-2 border border-slate-200 rounded">
						{format(filters.price[1])}
					</span>
				</div>
			</div>

			{/* CHECKBOX FILTERS */}
			<div className="border border-slate-300 p-6 rounded-lg bg-white">
				<div className="flex items-center gap-2">
					<Checkbox
						checked={filters.inStock}
						onChange={(e) =>
							setFilters((p) => ({ ...p, inStock: e.target.checked }))
						}
						title="In stock"
					/>
				</div>

				{["colors", "sizes", "materials", "features"].map((group) => (
					<div key={group} className="border-t border-gray-200 mt-6 pt-6">
						<h4 className="font-semibold mb-2 capitalize">{group}</h4>

						<div className="space-y-3">
							{unique(group).map((val) => (
								<div key={val} className="flex items-center gap-2 text-sm">
									<Checkbox
										checked={filters[group].includes(val)}
										onChange={() => toggleValue(group, val)}
										title={val}
									/>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</>
	);

	// -------------------------------
	// RENDER
	// -------------------------------
	return (
		<>
			{/* MOBILE FILTER BUTTON */}
			<button
				onClick={toggleDrawer}
				className="
					lg:hidden w-full flex items-center gap-2 justify-start
					bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800
				"
			>
				<RiListSettingsLine className="w-5 h-5" />
				<span className="font-medium">{t("filters")}</span>
			</button>

			{/* DESKTOP SIDEBAR */}
			<aside className="lg:col-span-1 space-y-6 hidden lg:block">
				{filterContent}
			</aside>

			{/* MOBILE DRAWER + OVERLAY (PORTALED ABOVE SmoothScroll) */}
			{hydrated &&
				typeof document !== "undefined" &&
				createPortal(
					<>
						{/* ⭐ BLURRED OVERLAY (matches Navigation) ⭐ */}
						<div
							ref={overlayRef}
							onClick={toggleDrawer}
							className="
								fixed inset-0 
								bg-black/30 
								backdrop-blur-sm 
								opacity-0 
								pointer-events-auto 
								max-lg:block 
								hidden 
								z-40
							"
							style={{ visibility: "hidden" }}
						/>

						{/* DRAWER — MIN WIDTH 350PX / MAX 100% */}
						<div
							ref={drawerRef}
							className={`
								fixed top-0 h-full bg-white shadow-2xl z-50 p-6 overflow-y-auto
								lg:hidden
								${dir === "rtl" ? "right-0" : "left-0"}
							`}
							style={{
								minWidth: "350px",
								maxWidth: "100%",
								width: "100%",

								// SSR-safe transform (no mismatch)
								transform: "translateX(0)",
							}}
						>
							{/* Drawer Header */}
							<div className="flex items-center justify-between mb-6">
								<span className="text-lg font-semibold">{t("filters")}</span>

								<button
									onClick={toggleDrawer}
									className="text-gray-600 hover:text-gray-800 text-xl"
								>
									✕
								</button>
							</div>

							{filterContent}
						</div>
					</>,
					document.getElementById("ui-layer")
				)}
		</>
	);
}
