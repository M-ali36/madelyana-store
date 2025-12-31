'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  HiChevronDown,
  HiChevronUp,
  HiColorSwatch,
  HiInformationCircle
} from 'react-icons/hi';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

/* ---------------------------------------
   Reusable Accordion Section
--------------------------------------- */
function Section({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2 text-base font-medium text-gray-800">
          {icon}
          {title}
        </div>

        {open ? (
          <HiChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <HiChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {open && (
        <div className="px-4 py-4 text-sm text-gray-700 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------
   Product Details Accordion
--------------------------------------- */
export default function ProductDetailsAccordion({ product }) {
  const t = useTranslations('product');

  return (
    <div className="space-y-3 mt-8">
      {/* Description — OPEN BY DEFAULT */}
      {product?.description && (
        <Section
          title={t('description')}
          icon={<HiInformationCircle className="w-6 h-6" />}
          defaultOpen
        >
          {documentToReactComponents(product.description)}
        </Section>
      )}

      {/* Colors */}
      {product?.colors?.length > 0 && (
        <Section
          title={t('colors')}
          icon={<HiColorSwatch className="w-6 h-6" />}
        >
          <ul className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <li
                key={color}
                className="px-3 py-1 rounded-full bg-gray-100 text-xs"
              >
                {color}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Sizes */}
      {product?.sizes?.length > 0 && (
        <Section title={t('sizes')}>
          <ul className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <li
                key={size}
                className="px-3 py-1 rounded-md border text-xs"
              >
                {size}
              </li>
            ))}
          </ul>
        </Section>
      )}
      
    </div>
  );
}
