export default function StepHeader({ title, stepLabel, stepValue }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-semibold">{title}</h1>

      <span className="text-sm text-gray-500">
        {stepLabel} {stepValue}
      </span>
    </div>
  );
}
