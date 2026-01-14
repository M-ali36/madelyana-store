"use client";

export default function UsersObserverTable({ sessions }) {
  const formatLastSeen = (ts) => {
    if (!ts || !ts.toMillis) return "—";
    const date = new Date(ts.toMillis());
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return "0 min";
    return `${(seconds / 60).toFixed(1)} min`;
  };

  return (
    <div className="overflow-x-auto rounded-lg bg-white">
      <table className="styled-table">
        <thead>
          <tr>
            <th className="p-3">Type</th>
            <th className="p-3">Email</th>
            <th className="p-3">Page</th>
            <th className="p-3">Entry</th>
            <th className="p-3">Device</th>
            <th className="p-3">Locale</th>
            <th className="p-3">Timezone</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Last Seen</th>
            <th className="p-3">Location</th>
          </tr>
        </thead>

        <tbody>
          {sessions.map((s) => (
            <tr key={s.sessionId}>
              <td>
                {s.isGuest ? (
                  <span className="text-orange-600">Guest</span>
                ) : (
                  <span className="text-green-600">User</span>
                )}
              </td>
              <td>{s.email || <span className="text-gray-400">—</span>}</td>
              <td>{s.page}</td>
              <td>{s.entryPage}</td>
              <td>{s.device} · {s.browser} · {s.os}</td>
              <td>{s.locale}</td>
              <td>{s.timezone}</td>
              <td>{formatDuration(s.sessionDuration)}</td>
              <td>{formatLastSeen(s.lastSeen)}</td>
              <td>
                {s.location
                  ? `${s.location.city || "—"}, ${s.location.countryCode || ""}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
