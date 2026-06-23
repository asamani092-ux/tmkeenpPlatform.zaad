import { NextResponse } from "next/server";
import { registerBeneficiary } from "@/lib/platform-service";
import { checkRateLimit } from "@/lib/rate-limit";

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
    const result = await registerBeneficiary({
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      educationLevel: String(body.educationLevel ?? ""),
      experience: String(body.experience ?? ""),
      skills: String(body.skills ?? ""),
      careerInterests: String(body.careerInterests ?? ""),
      cvUrl: body.cvUrl ? String(body.cvUrl) : undefined,
      certificatesUrls: body.certificatesUrls
        ? String(body.certificatesUrls)
        : undefined,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
