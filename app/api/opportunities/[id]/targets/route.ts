import { NextResponse } from "next/server";
import { setOpportunityTargets } from "@/lib/platform-service";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const targets = await prisma.opportunityTarget.findMany({
    where: { opportunityId: id },
    select: { beneficiaryId: true },
  });

  return NextResponse.json({
    beneficiaryIds: targets.map((t) => t.beneficiaryId),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { beneficiaryIds } = await request.json();
    const result = await setOpportunityTargets(
      id,
      Array.isArray(beneficiaryIds) ? beneficiaryIds.map(String) : []
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
