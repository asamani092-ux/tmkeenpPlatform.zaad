import { NextResponse } from "next/server";
import { updateOpportunity, deleteOpportunity } from "@/lib/platform-service";
import { OpportunityType } from "@/generated/prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateOpportunity(id, {
      type: body.type as OpportunityType | undefined,
      title: body.title,
      provider: body.provider,
      duration: body.duration,
      status: body.status,
      requirements: body.requirements,
      salary: body.salary,
      jobType: body.jobType,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteOpportunity(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
