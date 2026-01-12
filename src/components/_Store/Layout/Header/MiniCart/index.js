"use client";

import { IoBagHandleOutline, IoBagHandle } from "react-icons/io5";
import { useAppContext } from "@/components/context/AppContext";

export default function CartButton() {
  const { cart, navState, setNavState } = useAppContext();
  const isOpen = navState === "cart";
  const toggleCart = () => setNavState(isOpen ? "" : "cart");

  return (
    <button className="header-control icons-hover primary-anime relative" onClick={toggleCart}>
      {cart.length > 0 ? (
        <>
        <IoBagHandle className="w-5 h-5 fill-emerald-500" />
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
        </>
      ) : (
        <IoBagHandleOutline className="w-5 h-5" />
      )}
    </button>
  );
}
