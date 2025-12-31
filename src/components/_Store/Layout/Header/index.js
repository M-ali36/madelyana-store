import React from 'react';
import Navigation from './Navigation';
import MiniCart from './MiniCart';
import MiniWishlist from './MiniWishlist';
import MiniAccount from './Customer';
import { getTranslations } from "next-intl/server";
import HeaderLogo from './HeaderLogo';  // <-- NEW IMPORT
import TopHeader from './TopHeader';

export default async function Header({ locale }) {

    const t = await getTranslations({ locale });

    // You never provided isHome logic — add your own here.
    const isHome = false; // placeholder

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white shadow">
            { /* top header */ }
            <TopHeader  locale={locale} />
            { /* main header */ }
            <div className="cont">
                <div className="grid grid-cols-12 items-center py-2">

                    {/* ⬇️ Moved into its own component */}
                    <HeaderLogo locale={locale} />

                    <div className="col-span-8">
                        <Navigation t={t} locale={locale}/>
                    </div>

                    <div className="col-span-2 flex gap-4 items-center justify-end">
                        <MiniCart />
                        <MiniWishlist />
                        <MiniAccount />
                    </div>
                </div>
            </div>
        </header>
    );
};
