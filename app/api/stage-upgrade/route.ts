import { NextResponse } from "next/server";
import { recommendStageUpgrade } from "@/lib/platform-service";

export async function POST(request: Request) {
  try {
    const { beneficiaryId } = await request.json();
    if (!beneficiaryId) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const result = await recommendStageUpgrade(String(beneficiaryId));
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, pendingStage: result.pendingStage });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
