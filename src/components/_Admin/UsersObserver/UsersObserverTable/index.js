"use client";

export default function UsersObserverTable({ sessions }) {
  console.log(sessions)
  return (
    <div className="overflow-x-auto rounded-lg bg-white">
      <table className="styled-table">
        <thead className="">
          <tr>
            <th className="p-3">Type</th>
            <th className="p-3">Email</th>
            <th className="p-3">Page</th>
            <th className="p-3">Entry</th>
            <th className="p-3">Device</th>
            <th className="p-3">Locale</th>
            <th className="p-3">Timezone</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Location</th>
          </tr>
        </thead>

        <tbody>
          {sessions.map((s) => (
            <tr key={s.sessionId} className="">
              <td className="">
                {s.isGuest ? (
                  <span className="text-orange-600">Guest</span>
                ) : (
                  <span className="text-green-600">User</span>
                )}
              </td>

              <td className="">
                {s.email || <span className="text-gray-400">—</span>}
              </td>

              <td className="">{s.page}</td>
              <td className="">{s.entryPage}</td>

              <td className="">
                {s.device} · {s.browser} · {s.os}
              </td>

              <td className="">{s.locale}</td>
              <td className="">{s.timezone}</td>

              <td className="">
                {Math.floor(s.sessionDuration || 0)}s
              </td>
              <td className="">
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
