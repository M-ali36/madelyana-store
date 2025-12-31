"use client";

import {
	HiOutlineUser,
	HiOutlineLogout,
	HiOutlineShoppingBag,
	HiOutlineHeart,
	HiOutlineCog,
} from "react-icons/hi";

import { auth } from "@/lib/firebaseClient";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/Ui/Link";
import { useAppContext } from "@/components/context/AppContext";
import { useLocale, useTranslations } from "next-intl";

export default function MiniAccount() {
	const [user, setUser] = useState(null);
	const { clearCart, navState, setNavState } = useAppContext();
	const router = useRouter();
	const dropdownRef = useRef(null);
	const locale = useLocale();

	// 🔥 Correct usage of translations
	const t = useTranslations("account");

	const toggleOpen = () => {
		setNavState(navState === "user" ? "" : "user");
	};

	// Nav items for logged-in users (translated)
	const userNavItems = [
		{ label: t("my_account"), href: "/customer", icon: HiOutlineUser },
		{ label: t("orders"), href: "/customer/orders", icon: HiOutlineShoppingBag },
		{ label: t("wishlist"), href: "/customer/wishlist", icon: HiOutlineHeart },
		{ label: t("settings"), href: "/customer/settings", icon: HiOutlineCog },
	];

	// Listen for auth changes
	useEffect(() => {
		const unsub = auth.onAuthStateChanged((u) => setUser(u));
		return () => unsub();
	}, []);

	// Logout handler
	const handleLogout = async () => {
		try {
			await clearCart();
			await auth.signOut();

			document.cookie = "firebase_id_token=; path=/; max-age=0; secure;";
			document.cookie = "auth_role=; path=/; max-age=0; secure;";

			localStorage.clear();
			sessionStorage.clear();

			router.replace("/login");
		} catch (err) {
			console.error("Logout error:", err);
		}
	};

	// If NOT logged in → show login button
	if (!user) {
		return (
			<Link href="/login" locale={locale} className="control-btn">
				<HiOutlineUser className="w-6 h-6" />
			</Link>
		);
	}

	// Logged-in → dropdown
	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={toggleOpen}
				className="control-btn relative"
			>
				<HiOutlineUser className="w-6 h-6" />
				<span className="absolute -top-1 -end-1 bg-green-500 w-2.5 h-2.5 rounded-full border border-white"></span>
			</button>

			{navState === "user" && (
				<div className="absolute end-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
					
					{userNavItems.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								href={item.href}
								locale={locale}
								className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
								onClick={() => setNavState("")}
							>
								<Icon className="w-5 h-5" />
								{item.label}
							</Link>
						);
					})}

					<div className="border-t my-2"></div>

					<button
						onClick={handleLogout}
						className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
					>
						<HiOutlineLogout className="w-5 h-5" />
						{t("logout")}
					</button>
				</div>
			)}
		</div>
	);
}
