import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "GUIDE") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { beneficiaryId, content } = await request.json();
  if (!beneficiaryId || !content?.trim()) {
    return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
  }

  const beneficiary = await prisma.user.findFirst({
    where: {
      id: beneficiaryId,
      role: "BENEFICIARY",
      guideId: session.id,
    },
  });

  if (!beneficiary) {
    return NextResponse.json({ error: "المستفيد غير موجود" }, { status: 404 });
  }

  const note = await prisma.note.create({
    data: {
      beneficiaryId,
      guideId: session.id,
      content: String(content).trim(),
    },
  });

  return NextResponse.json({ note });
}
