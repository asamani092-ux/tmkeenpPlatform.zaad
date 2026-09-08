"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { formatArDateTime } from "@/lib/datetime-local";

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
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        setLoadError(true);
        return;
      }
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
    // Poll only while the tab is visible; refresh on return to the tab.
    const interval = setInterval(() => {
      if (!document.hidden) load();
    }, 60000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function markRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Network hiccup — the periodic reload restores true state.
    }
    load();
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch {
      // Network hiccup — the periodic reload restores true state.
    }
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
              {!loaded ? (
                <li role="status" aria-live="polite" className="space-y-2 p-1">
                  <span className="sr-only">جارٍ تحميل الإشعارات</span>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="zad-skeleton block h-14 w-full" />
                  ))}
                </li>
              ) : loadError ? (
                <li className="py-4 text-center text-sm text-brand-gray">
                  تعذر تحميل الإشعارات
                  <button
                    type="button"
                    className="mt-2 block w-full text-xs font-semibold text-primary"
                    onClick={load}
                  >
                    إعادة المحاولة
                  </button>
                </li>
              ) : items.length === 0 ? (
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
                      {formatArDateTime(n.createdAt)}
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
