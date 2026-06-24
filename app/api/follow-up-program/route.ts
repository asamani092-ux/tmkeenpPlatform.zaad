import { NextResponse } from "next/server";
import {
  completeFollowUpProgram,
  withdrawFollowUpProgram,
} from "@/lib/follow-up-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { beneficiaryId, action, reason } = body;

    if (action === "complete") {
      const result = await completeFollowUpProgram(beneficiaryId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "withdraw") {
      const result = await withdrawFollowUpProgram(beneficiaryId, reason);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
