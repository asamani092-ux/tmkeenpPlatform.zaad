import { NextResponse } from "next/server";
import {
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from "@/lib/platform-service";
import { FollowUpStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const followUps = await prisma.followUp.findMany({
    include: {
      beneficiary: { select: { id: true, name: true, phone: true } },
    },
    orderBy: [{ beneficiaryId: "asc" }, { month: "asc" }],
  });

  return NextResponse.json({ followUps });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createFollowUp({
      beneficiaryId: body.beneficiaryId,
      month: Number(body.month),
      status: body.status as FollowUpStatus | undefined,
      notes: body.notes,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, notes } = await request.json();
    const result = await updateFollowUp(id, {
      status: status as FollowUpStatus | undefined,
      notes,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const result = await deleteFollowUp(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
