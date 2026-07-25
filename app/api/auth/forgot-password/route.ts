import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { checkHourlyRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email-notify";
import { getSystemSettings } from "@/lib/system-settings";

const SUCCESS_MESSAGE =
  "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك. الرابط صالح لمدة 10 دقائق.";
const NOT_FOUND_MESSAGE = "البريد غير مسجّل في النظام";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** O(1) per request — token create + email, or explicit not-found */
export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const { email } = await request.json();
    const normalizedEmail = String(email ?? "")
      .toLowerCase()
      .trim();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    if (
      !checkHourlyRateLimit(`forgot-password:ip:${ip}`) ||
      !checkHourlyRateLimit(`forgot-password:email:${normalizedEmail}`)
    ) {
      return NextResponse.json(
        { error: "محاولات كثيرة — حاول لاحقاً" },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
    const settings = await getSystemSettings();

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      senderEmail: settings.senderEmail,
    });

    return NextResponse.json({ message: SUCCESS_MESSAGE });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
