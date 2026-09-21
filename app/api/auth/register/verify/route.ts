import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyRegistrationChallenge } from "@/lib/register-verification";
import { createSession } from "@/lib/session";

/** Confirm email OTP and create the beneficiary account */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!checkRateLimit(`register-verify:${ip}`)) {
      return NextResponse.json(
        { error: "محاولات كثيرة. انتظر دقيقة ثم حاول مجدداً." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = await verifyRegistrationChallenge(
      String(body.challengeId ?? ""),
      String(body.code ?? "")
    );

    if (!result.success || !result.userId) {
      return NextResponse.json(
        { error: result.success ? "تعذر إنشاء الجلسة" : result.error },
        { status: 400 }
      );
    }

    await createSession(result.userId, "BENEFICIARY");

    return NextResponse.json({
      success: true,
      redirect: "/dashboard/beneficiary",
    });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
