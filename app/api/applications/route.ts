import { NextResponse } from "next/server";
import { applyToOpportunity } from "@/lib/platform-service";

export async function POST(request: Request) {
  try {
    const { opportunityId } = await request.json();
    if (!opportunityId) {
      return NextResponse.json({ error: "معرّف الفرصة مطلوب" }, { status: 400 });
    }

    const result = await applyToOpportunity(String(opportunityId));
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
