import React from 'react';
import { HiMenu } from "react-icons/hi";
import PropTypes from 'prop-types';
import Link from 'next/link';

const Navigation = props => {
    return (
        <nav>
            <button className="lg:hidden" type="button">
                <HiMenu />
            </button>
            <ul className="flex justify-center">
                <li className="px-2 py-4">
                    <Link href="/" className="link">Women's Bags</Link>
                </li>
                <li className="px-2 py-4">
                    <Link href="/" className="link">men's Bags</Link>
                </li>
                <li className="px-2 py-4">
                    <Link href="/" className="link">Gifts</Link>
                </li>
            </ul>
        </nav>
    );
};

Navigation.propTypes = {
    
};

export default Navigation;