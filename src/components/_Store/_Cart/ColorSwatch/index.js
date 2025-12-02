export default function ColorSwatch({ label }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="w-4 h-4 rounded-full border"
        style={{ backgroundColor: label.toLowerCase() }}
      />
      <span className="text-xs">{label}</span>
    </div>
  );
}
