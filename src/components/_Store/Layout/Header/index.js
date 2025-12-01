import React from 'react';
import PropTypes from 'prop-types';
import Logo from '@/svgs/Logo';
import Navigation from './Navigation';
import MiniCart from './MiniCart';
import MiniWishlist from './MiniWishlist';
import CurrencySwitcher from './CurrencySwitcher';

const Header = props => {
    return (
        <header className="">
            <div className="px-4 py-2 w-full text-center text-white bg-black">Free shipping with over 12$</div>
            <div className="cont">
                <div className="grid grid-cols-12 items-center py-2">
                    <div className="col-span-2">
                        <Logo className="w-48" />
                    </div>
                    <div className="col-span-8">
                        <Navigation />
                    </div>
                    <div className="col-span-2 flex gap-4 items-center justify-end">
                        <MiniCart />
                        <MiniWishlist />
                        <CurrencySwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    
};

export default Header;