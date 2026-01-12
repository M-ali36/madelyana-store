"use client";

import { HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";

export default function WishlistButton() {
  const { wishlist, navState, setNavState } = useAppContext();

  const isOpen = navState === "wishlist";

  const toggle = () => {
    setNavState(isOpen ? "" : "wishlist");
  };

  return (
    <button
      aria-label="My Wishlist"
      onClick={toggle}
      className="header-control icons-hover primary-anime"
    >
      {wishlist.length > 0 ? (
        <HiHeart className="w-5 h-5 fill-rose-500" />
      ) : (
        <HiOutlineHeart className="w-5 h-5" />
      )}
    </button>
  );
}
