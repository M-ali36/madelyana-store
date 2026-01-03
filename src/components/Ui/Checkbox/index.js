"use client";

import { HiCheck } from "react-icons/hi";

export default function Checkbox({ checked, onChange, title }) {
	return (
		<label className="relative flex gap-2 items-center cursor-pointer select-none">
			{/* Hidden Input */}
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				className="peer sr-only absolute h-full w-full top-0 left-0"
			/>

			{/* Custom Checkbox */}
			<div
				className="
					h-5 w-5 
					border border-gray-400 rounded 
					flex items-center justify-center
					peer-checked:bg-neutral-900 
					peer-checked:border-black
					transition
				"
			>
				<HiCheck
					className="
						text-white text-lg 
						opacity-100 peer-checked:opacity-100 
						transition-opacity
					"
				/>
			</div>
            {title}
		</label>
	);
}
