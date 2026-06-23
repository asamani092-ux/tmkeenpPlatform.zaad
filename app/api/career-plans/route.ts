import { NextResponse } from "next/server";
import { upsertCareerPlanTasks } from "@/lib/platform-service";
import { CareerPlanStatus } from "@/generated/prisma/client";

export async function PUT(request: Request) {
  try {
    const { beneficiaryId, tasks, status } = await request.json();
    if (!beneficiaryId || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }
    const result = await upsertCareerPlanTasks({
      beneficiaryId: String(beneficiaryId),
      tasks,
      status: status as CareerPlanStatus | undefined,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
