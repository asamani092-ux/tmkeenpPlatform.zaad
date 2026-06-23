import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(session.id),
    getUnreadNotificationCount(session.id),
  ]);

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();

  if (body.markAllRead) {
    await markAllNotificationsRead(session.id);
    return NextResponse.json({ success: true });
  }

  if (body.id) {
    const ok = await markNotificationRead(String(body.id), session.id);
    if (!ok) {
      return NextResponse.json({ error: "الإشعار غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
}
