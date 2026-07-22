import { NextResponse } from "next/server";
import { sendManualFollowUpReminder } from "@/lib/follow-up-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const beneficiaryId = String(body.beneficiaryId ?? "");
    if (!beneficiaryId) {
      return NextResponse.json({ error: "معرف المستفيد مطلوب" }, { status: 400 });
    }

    const result = await sendManualFollowUpReminder(beneficiaryId);
    if (!result.success) {
      const status = result.error === "غير مصرح" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
