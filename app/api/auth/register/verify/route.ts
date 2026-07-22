import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyRegistrationChallenge } from "@/lib/register-verification";

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

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
