import { NextResponse } from "next/server";
import { createOpportunity } from "@/lib/platform-service";
import { OpportunityType } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, provider, duration, status, requirements, salary, jobType } =
      body;

    if (!type || !title || !provider || !duration || !status) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    if (!["TRAINING", "EMPLOYMENT"].includes(type)) {
      return NextResponse.json({ error: "نوع الفرصة غير صالح" }, { status: 400 });
    }

    const result = await createOpportunity({
      type: type as OpportunityType,
      title: String(title),
      provider: String(provider),
      duration: String(duration),
      status: String(status),
      requirements: String(requirements ?? ""),
      salary: String(salary ?? ""),
      jobType: String(jobType ?? ""),
    });

    if (!result.success) {
      const status = result.error === "غير مصرح" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
