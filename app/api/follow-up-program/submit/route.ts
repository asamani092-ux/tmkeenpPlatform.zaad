import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { submitFollowUpForm } from "@/lib/follow-up-service";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BENEFICIARY") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const month = Number(body.month);
    const answers = body.answers as Record<string, string>;

    const result = await submitFollowUpForm(session.id, month, answers ?? {});
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
