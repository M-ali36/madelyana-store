"use client";

export default function ProductAttributeSelector({
  attributeKeys,
  attributeOptions,
  selected,
  setSelected,
}) {
  return (
    <>
      {attributeKeys.map((key) => (
        <div className="mb-3" key={key}>
          <p className="text-xs font-medium text-gray-500 mb-1">
            {key.charAt(0).toUpperCase() + key.slice(1)}:
          </p>

          <div className="flex flex-wrap gap-2">
            {attributeOptions[key].map((value) => (
              <button
                key={value}
                onClick={() =>
                  setSelected((p) => ({ ...p, [key]: value }))
                }
                className={`px-3 py-1 text-xs rounded border
                  ${
                    selected[key] === value
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800"
                  }
                `}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
