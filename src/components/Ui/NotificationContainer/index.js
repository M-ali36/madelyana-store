"use client";

import { useAppContext } from "@/components/context/AppContext";
import Notification from "../Notification";

export default function NotificationContainer({locale}) {
  const { notifications, removeNotification } = useAppContext();

  return (
    <div className="fixed bottom-5 end-5 z-[999999] flex flex-col gap-4">
      {notifications.map((n) => (
        <Notification
          key={n.id}
          {...n}
          onClose={removeNotification}
          locale={locale}
        />
      ))}
    </div>
  );
}
