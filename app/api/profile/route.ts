import { NextResponse } from "next/server";
import { updateBeneficiaryProfile } from "@/lib/platform-service";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = await updateBeneficiaryProfile({
      educationLevel: String(body.educationLevel ?? ""),
      experience: String(body.experience ?? ""),
      skills: String(body.skills ?? ""),
      careerInterests: String(body.careerInterests ?? ""),
      phone: String(body.phone ?? ""),
      cvUrl: body.cvUrl != null ? String(body.cvUrl) : undefined,
      certificatesUrls:
        body.certificatesUrls != null ? String(body.certificatesUrls) : undefined,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
