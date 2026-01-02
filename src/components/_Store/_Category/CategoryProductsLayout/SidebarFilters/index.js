"use client";

import Checkbox from "@/components/Ui/Checkbox";
import useCurrency from "@/components/hooks/useCurrency";
import { useMemo } from "react";

export default function SidebarFilters({ products, filters, setFilters }) {
	const { format } = useCurrency();
	const unique = (key) =>
		[...new Set(products.flatMap((p) => p[key] || []))];

	const toggleValue = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: prev[key].includes(value)
				? prev[key].filter((v) => v !== value)
				: [...prev[key], value],
		}));
	};

	// Compute min/max from available products
	const [minPrice, maxPrice] = useMemo(() => {
		const prices = products
			.map((p) => Number(p.price))
			.filter((v) => !isNaN(v));

		return [
			prices.length ? Math.min(...prices) : 0,
			prices.length ? Math.max(...prices) : 0,
		];
	}, [products]);

	const handlePriceChange = (type, value) => {
		value = Number(value);

		setFilters((prev) => {
			let [minVal, maxVal] = prev.price;

			if (type === "min") {
				minVal = Math.min(value, maxVal - 1); // prevent overlap
			}
			if (type === "max") {
				maxVal = Math.max(value, minVal + 1); // prevent overlap
			}

			return { ...prev, price: [minVal, maxVal] };
		});
	};

	return (
		<aside className="lg:col-span-1 space-y-6">

			{/* PRICE RANGE */}
			<div className="price-range-slider shadow-lg p-6 rounded-lg bg-white">
				<h4 className="mb-3 font-bold">By Price</h4>

				{/* Slider Track + Thumbs */}
				<div className="slider-container relative pt-6 pb-2">

					{/* Track */}
					<div className="slider-track"></div>

					{/* Active Range */}
					<div
					className="slider-range"
					style={{
						insetInlineStart: `${((filters.price[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
						insetInlineEnd: `${100 - ((filters.price[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
					}}
					/>

					{/* Min thumb */}
					<input
					type="range"
					min={minPrice}
					max={maxPrice}
					value={filters.price[0]}
					onChange={(e) => handlePriceChange("min", e.target.value)}
					className="slider-thumb"
					/>

					{/* Max thumb */}
					<input
					type="range"
					min={minPrice}
					max={maxPrice}
					value={filters.price[1]}
					onChange={(e) => handlePriceChange("max", e.target.value)}
					className="slider-thumb"
					/>
				</div>

				{/* Display Values */}
				<div className="flex items-center gap-3 mt-4">
					<span className="text-sm">From</span>
					<span className="text-xs p-2 border border-slate-200 rounded">{format(filters.price[0])}</span>

					<span className="text-sm">To</span>
					<span className="text-xs p-2 border border-slate-200 rounded">{format(filters.price[1])}</span>
				</div>
			</div>
			<div className="shadow-lg p-6 rounded-lg bg-white">
				{/* In Stock */}
				<div className="flex items-center gap-2">
					<Checkbox
						checked={filters.inStock}
						onChange={(e) =>
							setFilters((p) => ({ ...p, inStock: e.target.checked }))
						}
						title="In stock"
					/>
				</div>

				{/* DYNAMIC GROUPS */}
				{["colors", "sizes", "materials", "features"].map((group) => (
					<div key={group} className="border-t border-gray-200 mt-6 pt-6">
						<h4 className="font-semibold mb-2 capitalize">{group}</h4>

						<div className="space-y-3">
							{unique(group).map((val) => (
								<div key={val} className="flex items-center gap-2 text-sm">
									<Checkbox
										checked={filters[group].includes(val)}
										onChange={() => toggleValue(group, val)}
										title={val}
									/>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</aside>
	);
}
