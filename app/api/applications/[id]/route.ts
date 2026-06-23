import { NextResponse } from "next/server";
import { reviewApplication } from "@/lib/platform-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, reviewNote } = await request.json();

    if (status !== "ACCEPTED" && status !== "REJECTED") {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    const result = await reviewApplication({
      applicationId: id,
      status,
      reviewNote: reviewNote != null ? String(reviewNote) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
