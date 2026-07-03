import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateBeneficiaryAccount } from "@/lib/platform-service";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BENEFICIARY") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();

    if (body.email != null || body.password != null) {
      const result = await updateBeneficiaryAccount({
        email: body.email != null ? String(body.email) : undefined,
        password: body.password ? String(body.password) : undefined,
      });
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

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
  } catch (err) {
    console.error("[profile/account]", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
