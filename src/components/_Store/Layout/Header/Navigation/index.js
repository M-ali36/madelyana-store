import React from 'react';
import { HiMenu } from "react-icons/hi";
import PropTypes from 'prop-types';
import Link from '@/components/Ui/Link';

const Navigation = ({t, locale}) => {
    return (
        <nav>
            <button className="lg:hidden" type="button">
                <HiMenu />
            </button>
            <ul className="flex justify-center">
                <li className="px-2 py-4">
                    <Link locale={locale} href="/women" className="link">{t('women_bags')}</Link>
                </li>
                <li className="px-2 py-4">
                    <Link locale={locale} href="/" className="link">men's Bags</Link>
                </li>
                <li className="px-2 py-4">
                    <Link locale={locale} href="/" className="link">Gifts</Link>
                </li>
            </ul>
        </nav>
    );
};

Navigation.propTypes = {
    
};

export default Navigation;