import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, getDashboardPath } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!checkRateLimit(`login:${ip}`)) {
      return NextResponse.json(
        { error: "محاولات كثيرة. انتظر دقيقة ثم حاول مجدداً." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user || !(await verifyPassword(String(password), user.password))) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "الحساب معلّق. تواصل مع الإدارة." },
        { status: 403 }
      );
    }

    await createSession(user.id, user.role);

    return NextResponse.json({
      redirect: getDashboardPath(user.role),
    });
  } catch {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
