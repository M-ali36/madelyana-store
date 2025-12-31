import { HiCheck } from "react-icons/hi";

export default function VariantSelector({
  attributeKeys,
  attributeOptions,
  selected,
  setSelected,
  variantImageMap = {},
}) {
  return (
    <div className="space-y-6 mb-8">
      {attributeKeys.map((key) => {
        const isColor =
          key.toLowerCase() === "color" ||
          key.toLowerCase() === "colors";

        return (
          <div key={key}>
            <h4 className="font-medium mb-2">{key}</h4>

            <div className="flex gap-3 flex-wrap">
              {attributeOptions[key].map((val) => {
                const active = selected[key] === val;
                const image =
                  variantImageMap[val.toLowerCase()] || null;

                return (
                  <div key={val} className="relative group">
                    <button
                      onClick={() =>
                        setSelected((prev) => ({
                          ...prev,
                          [key]: val,
                        }))
                      }
                      className={`relative px-4 py-2 rounded border border-black text-sm transition heavy-shade-box cursor-pointer ${active ? 'active' : ''}`}
                    >
                      {val}
                    </button>

                    {/* TOOLTIP */}
                    {image && (
                      <div
                        className={`absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2
                          w-28 p-2 bg-white border border-gray-200 rounded shadow
                          transition-all duration-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:z-[1]`}
                      >
                        <img
                          src={image}
                          alt={val}
                          className="w-full h-auto object-cover rounded"
                        />
                        <p className="text-xs text-center mt-1 text-gray-700">
                          {val}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
