import { useEffect, useState } from "react";

/**
 * Generates & persists a sessionId for guests and users
 */
export default function useSessionId() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let id = localStorage.getItem("session_id");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("session_id", id);
    }

    setSessionId(id);
  }, []);

  return sessionId;
}
