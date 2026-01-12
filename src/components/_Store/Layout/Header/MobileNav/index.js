"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { HiOutlineHome } from "react-icons/hi2";
import { RiSearch2Line } from "react-icons/ri";
import { IoBagHandle, IoBagHandleOutline, IoLogoWhatsapp } from "react-icons/io5";
import { PiWhatsappLogoLight } from "react-icons/pi";
import { AiOutlineUser } from "react-icons/ai";
import { BsShop } from "react-icons/bs";
import { useAppContext } from "@/components/context/AppContext";

export default function MobileNav({locale}) {
  const t = useTranslations("MobileNav");
  const router = useRouter();
  const { cart, navState, setNavState } = useAppContext();

  const navItems = [
    {
      key: "home",
      type: "link",
      href: "/",
      icon: <HiOutlineHome size={18} />,
      label: t("home"),
    },
    {
      key: "search",
      type: "action",
      onClick: () => setNavState("search"),
      icon: <RiSearch2Line size={18} />,
      label: t("search"),
    },
    {
      key: "cart",
      type: "link",
      href: "/cart",
      icon: <IoBagHandleOutline size={25} />,
      label: t("cart"),
      primary: true
    },
    {
      key: "discover",
      type: "link",
      href: "/women",
      icon: <BsShop size={16} />,
      label: t("discover"),
    },
    {
      key: "whatsapp",
      type: "link",
      href: "https://wa.me/XXXXXXXXX",
      icon: <IoLogoWhatsapp size={18} />,
      label: t("touch"),
      external: true,
    },
  ];

  return (
    <nav className=" lg:hidden fixed bottom-0 left-0 w-full bg-neutral-900 border-t border-neutral-800 z-50 px-4">
      <div className="grid grid-cols-5 justify-center items-center">
        <div className="mx-auto text-white px-4 py-3 border-e border-s border-neutral-700 flex w-full items-center justify-center">
            <Link locale={locale} href='/' >
                <HiOutlineHome className="h-6 w-6" />
            </Link>
        </div>
        <div className="mx-auto text-white px-4 py-3 border-e border-neutral-700 flex w-full items-center justify-center">
            <button onClick={() => setNavState("search")} href='/' >
                <RiSearch2Line className="h-6 w-6" />
            </button>
        </div>
        <div className="mx-auto px-4 py-3 flex border-e border-neutral-700 w-full items-center justify-center">
            <Link locale={locale} href='/cart' className="relative rounded-full h-12 w-12 -mt-8 outline outline-neutral-900 outline-[8px] text-neutral-900 bg-white flex items-center justify-center" >
                {cart.length > 0 ? (
                    <>
                    <IoBagHandle className="w-6 h-6 fill-emerald-500" />
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                    </>
                ) : (
                    <IoBagHandleOutline className="w-6 h-6" />
                )}
            </Link>
        </div>
        <div className="mx-auto text-white px-4 py-3 border-e border-neutral-700 flex w-full items-center justify-center">
            <Link locale={locale} href='/customer' >
                <AiOutlineUser className="h-6 w-6" />
            </Link>
        </div>
        <div className="mx-auto text-emerald-500 px-4 py-3 border-e border-neutral-700 flex w-full items-center justify-center">
            <a href='https://wa.me/00201092833050' >
                <PiWhatsappLogoLight className="h-6 w-6" />
            </a>
        </div>
      </div>
    </nav>
  );
}
