import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { startRegistrationChallenge } from "@/lib/register-verification";

/** Start registration + send email OTP — does not create the user yet */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!checkRateLimit(`register:${ip}`)) {
      return NextResponse.json(
        { error: "محاولات كثيرة. انتظر دقيقة ثم حاول مجدداً." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = await startRegistrationChallenge({
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      educationLevel: String(body.educationLevel ?? ""),
      experience: String(body.experience ?? ""),
      skills: String(body.skills ?? ""),
      careerInterests: String(body.careerInterests ?? ""),
      cvUrl: String(body.cvUrl ?? ""),
      certificatesUrls: String(body.certificatesUrls ?? ""),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      challengeId: result.challengeId,
      requiresVerification: true,
      ...(result.previewCode ? { previewCode: result.previewCode } : {}),
    });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
