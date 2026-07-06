"use client";

import { useState } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import GuideAccountEdit from "@/components/guide/GuideAccountEdit";
import { LayoutDashboard, LogOut, Pencil } from "lucide-react";

type Props = {
  userName: string;
  email: string;
};

export default function GuideNavbarActions({ userName, email }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <span className="max-w-[140px] truncate text-sm font-semibold text-primary sm:max-w-[200px]">
          {userName}
        </span>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
          title="تعديل الحساب"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      <NotificationBell />
      <Link
        href="/dashboard/guide"
        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-primary transition hover:bg-surface-muted sm:px-3"
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden sm:inline">لوحة التحكم</span>
      </Link>
      <form action="/api/auth/logout" method="POST" noValidate className="shrink-0">
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-brand-gray transition hover:bg-surface-muted hover:text-primary sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </form>
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="card w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-bold text-primary">تعديل حساب المرشد</h2>
            <GuideAccountEdit email={email} onSaved={() => setEditOpen(false)} />
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="btn-secondary mt-3 w-full !py-2 text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
}
