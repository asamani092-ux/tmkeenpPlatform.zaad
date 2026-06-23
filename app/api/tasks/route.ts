import { NextResponse } from "next/server";
import { createTask } from "@/lib/platform-service";

export async function POST(request: Request) {
  try {
    const { beneficiaryId, title, description } = await request.json();
    if (!beneficiaryId || !title) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const result = await createTask({
      beneficiaryId: String(beneficiaryId),
      title: String(title),
      description: description != null ? String(description) : undefined,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, taskId: result.taskId });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
