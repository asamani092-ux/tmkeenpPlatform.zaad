import { NextResponse } from "next/server";
import { adminUpdateBeneficiary } from "@/lib/platform-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await adminUpdateBeneficiary(id, {
      phone: body.phone != null ? String(body.phone) : undefined,
      educationLevel:
        body.educationLevel != null ? String(body.educationLevel) : undefined,
      experience: body.experience != null ? String(body.experience) : undefined,
      skills: body.skills != null ? String(body.skills) : undefined,
      careerInterests:
        body.careerInterests != null ? String(body.careerInterests) : undefined,
      guideId:
        body.guideId === null || body.guideId === ""
          ? null
          : body.guideId != null
            ? String(body.guideId)
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
