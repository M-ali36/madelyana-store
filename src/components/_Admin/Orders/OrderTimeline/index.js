export default function OrderTimeline({ status }) {
  const steps = ["Pending", "Paid", "Shipped", "Completed"];

  return (
    <div className="flex items-center gap-6 py-4">
      {steps.map((step, index) => {
        const active = steps.indexOf(status) >= index;

        return (
          <div key={step} className="flex items-center gap-3">
            {/* Dot */}
            <div
              className={`
                w-4 h-4 rounded-full border-2
                ${active ? "bg-primary border-primary" : "bg-white border-gray-300"}
              `}
            ></div>

            <span className={`text-sm ${active ? "font-semibold text-primary" : "text-gray-500"}`}>
              {step}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-10 h-0.5 ${
                  active ? "bg-primary" : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
