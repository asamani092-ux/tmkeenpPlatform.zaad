import { NextResponse } from "next/server";
import { assignGuideToBeneficiary } from "@/lib/platform-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { guideId } = await request.json();
    const result = await assignGuideToBeneficiary({
      beneficiaryId: id,
      guideId: guideId ?? null,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
