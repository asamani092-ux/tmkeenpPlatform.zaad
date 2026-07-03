import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { checkHourlyRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email-notify";
import { getSystemSettings } from "@/lib/system-settings";

const SUCCESS_MESSAGE =
  "إذا كان البريد مسجّلاً لدينا، ستصلك رسالة برابط إعادة التعيين خلال دقائق.";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** O(1) per request — token create + optional email */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const { email } = await request.json();
    const normalizedEmail = String(email ?? "").toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    if (
      !checkHourlyRateLimit(`forgot-password:ip:${ip}`) ||
      !checkHourlyRateLimit(`forgot-password:email:${normalizedEmail}`)
    ) {
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
        /\/$/,
        ""
      );
      const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
      const settings = await getSystemSettings();

      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
        senderEmail: settings.senderEmail,
      });
    }

    return NextResponse.json({ message: SUCCESS_MESSAGE });
  } catch {
    return NextResponse.json({ message: SUCCESS_MESSAGE });
  }
}
