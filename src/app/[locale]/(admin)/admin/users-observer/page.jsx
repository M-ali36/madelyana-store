"use client";

import useLiveSessions from "@/components/_Admin/UsersObserver/UsersObserverTable/useLiveSessions";
import UsersObserverTable from "@/components/_Admin/UsersObserver/UsersObserverTable";

export default function UsersObserverPage() {
  const { sessions, loading, data } = useLiveSessions();

  console.log(data)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Live Users Observer
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading live sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">No users online.</p>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Online now: <strong>{sessions.length}</strong>
          </p>

          <UsersObserverTable sessions={sessions} />
        </>
      )}
    </div>
  );
}
