export default function TrackingLinks({ tracking }) {
  if (!tracking) return null;

  const carriers = [
    {
      name: "DHL",
      url: `https://www.dhl.com/en/express/tracking.html?AWB=${tracking}`,
    },
    {
      name: "Aramex",
      url: `https://www.aramex.com/track/results?ShipmentNumber=${tracking}`,
    },
    {
      name: "FedEx",
      url: `https://www.fedex.com/fedextrack/?trknbr=${tracking}`,
    },
    {
      name: "UPS",
      url: `https://www.ups.com/track?loc=en_US&tracknum=${tracking}`,
    },
  ];

  return (
    <div className="space-y-2 mt-2">
      <p className="text-sm text-gray-700 font-medium">Tracking Links:</p>

      <div className="flex flex-wrap gap-2">
        {carriers.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            className="px-3 py-1 bg-primary/10 text-primary border border-primary rounded-md text-sm hover:bg-neutral-900 hover:text-white transition"
          >
            {c.name}
          </a>
        ))}
      </div>
    </div>
  );
}
