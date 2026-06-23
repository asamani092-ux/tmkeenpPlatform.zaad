import { NextResponse } from "next/server";
import { updateBeneficiaryByGuide } from "@/lib/platform-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateBeneficiaryByGuide(id, {
      cvContent: body.cvContent,
      professionalRecommendations: body.professionalRecommendations,
      selectedTrainingCourseIds: Array.isArray(body.selectedTrainingCourseIds)
        ? body.selectedTrainingCourseIds.map(String)
        : undefined,
      educationLevel: body.educationLevel,
      experience: body.experience,
      skills: body.skills,
      careerInterests: body.careerInterests,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
