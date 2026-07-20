import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** O(1) — verify token, update password, invalidate other tokens */
export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();
    const rawToken = String(token ?? "").trim();
    const password = String(newPassword ?? "");

    if (!rawToken || !password) {
      return NextResponse.json({ error: "البيانات غير مكتملة" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(rawToken);
    const now = new Date();

    const record = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      select: { id: true, userId: true },
    });

    if (!record) {
      return NextResponse.json(
        { error: "رابط إعادة التعيين غير صالح أو منتهٍ" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: now },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: record.userId,
          id: { not: record.id },
          usedAt: null,
        },
        data: { usedAt: now },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
