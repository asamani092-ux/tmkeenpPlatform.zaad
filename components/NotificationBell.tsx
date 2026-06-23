"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications ?? []);
    setUnread(data.unreadCount ?? 0);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
        aria-label="الإشعارات"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-800 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute start-0 top-full z-50 mt-2 w-80 max-w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-surface-border bg-surface p-3 text-right shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-primary hover:underline"
              >
                تعليم الكل كمقروء
              </button>
              <h3 className="font-bold text-primary">الإشعارات</h3>
            </div>
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {items.length === 0 ? (
                <li className="py-4 text-center text-sm text-brand-gray">لا توجد إشعارات</li>
              ) : (
                items.map((n) => (
                  <li
                    key={n.id}
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition hover:bg-surface-muted ${
                      n.isRead ? "border-surface-border opacity-75" : "border-primary/30 bg-primary/5"
                    }`}
                    onClick={() => !n.isRead && markRead(n.id)}
                  >
                    <p className="font-semibold text-primary">{n.title}</p>
                    <p className="mt-1 text-brand-gray">{n.message}</p>
                    <p className="mt-1 text-xs text-brand-gray">
                      {new Date(n.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
