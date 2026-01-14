export default function Input({ label, value, onChange }) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="font-medium">{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded p-2 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
