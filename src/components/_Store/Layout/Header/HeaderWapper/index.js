'use client';

import React from 'react';
import { useAppContext } from '@/components/context/AppContext';

const HeaderWrapper = ({children}) => {
    const {scrollPosition} = useAppContext();
    return (
        <header className={`fixed flex justify-center top-0 left-0 w-full z-50 text-white`}>
            <div className={`shadow transition-all duration-[350ms] max-lg:w-full max-lg:bg-neutral-900 ease-in-out ${scrollPosition > 250 ? 'blurred-header' : 'normal-header'}`}>
                <div className="max-w-7xl mx-auto">{children}</div>
            </div>
        </header>
    );
};


export default HeaderWrapper;