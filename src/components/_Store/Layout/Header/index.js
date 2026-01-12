import React from 'react';
import Navigation from './Navigation';
import MiniCart from './MiniCart';
import MiniWishlist from './MiniWishlist';
import MiniAccount from './Customer';
import { getTranslations } from "next-intl/server";
import HeaderLogo from './HeaderLogo';  // <-- NEW IMPORT
import TopHeader from './TopHeader';
import HeaderWrapper from './HeaderWapper';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header({ locale }) {

    const t = await getTranslations({ locale });

    // You never provided isHome logic — add your own here.
    const isHome = false; // placeholder

    return (
        <HeaderWrapper>
            { /* main header */ }
            <div className="cont">
                <div className="grid grid-cols-12 items-center py-2">

                    {/* ⬇️ Moved into its own component */}
                    <HeaderLogo locale={locale} />

                    <div className="col-span-4 max-lg:items-end lg:col-span-6 xl:col-span-8 max-lg:flex">
                        <Navigation />
                    </div>

                    <div className="col-span-4 lg:col-span-3 xl:col-span-2 hidden lg:flex gap-4 items-center justify-end">
                        <MiniCart />
                        <MiniWishlist />
                        <MiniAccount />
                        <LanguageSwitcher locale={locale} desktop={true}/>
                    </div>
                </div>
            </div>
        </HeaderWrapper>
    );
};
