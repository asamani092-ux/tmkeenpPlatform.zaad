import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BENEFICIARY") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const { action, confirmText } = body;

    if (action === "suspend") {
      if (confirmText !== "تعليق") {
        return NextResponse.json({ error: "اكتب «تعليق» للتأكيد" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: session.id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, logout: true });
    }

    if (action === "delete") {
      if (confirmText !== "حذف") {
        return NextResponse.json({ error: "اكتب «حذف» للتأكيد" }, { status: 400 });
      }
      await prisma.user.delete({ where: { id: session.id } });
      return NextResponse.json({ success: true, logout: true });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
