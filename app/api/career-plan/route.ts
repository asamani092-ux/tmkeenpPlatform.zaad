import { NextResponse } from "next/server";
import { updateCareerPlan } from "@/lib/platform-service";

export async function PATCH(request: Request) {
  try {
    const { beneficiaryId, careerPlan } = await request.json();
    if (!beneficiaryId) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const result = await updateCareerPlan({
      beneficiaryId: String(beneficiaryId),
      careerPlan: String(careerPlan ?? ""),
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
