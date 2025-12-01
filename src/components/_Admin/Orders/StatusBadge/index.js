export default function StatusBadge({ status }) {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    Paid: "bg-blue-100 text-blue-700 border border-blue-300",
    Shipped: "bg-purple-100 text-purple-700 border border-purple-300",
    Completed: "bg-green-100 text-green-700 border border-green-300",
    Cancelled: "bg-red-100 text-red-700 border border-red-300",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        colors[status] || "bg-gray-100 text-gray-700 border border-gray-300"
      }`}
    >
      {status}
    </span>
  );
}
