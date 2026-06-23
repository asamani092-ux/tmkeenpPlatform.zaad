import { NextResponse } from "next/server";
import {
  approveRegistration,
  approveStageTransition,
} from "@/lib/platform-service";

export async function POST(request: Request) {
  try {
    const { beneficiaryId, action } = await request.json();
    if (!beneficiaryId) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const result =
      action === "registration"
        ? await approveRegistration(String(beneficiaryId))
        : await approveStageTransition(String(beneficiaryId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      stage: "stage" in result ? result.stage : undefined,
    });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
