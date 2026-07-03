import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const question = await prisma.followUpFormQuestion.update({
    where: { id },
    data: {
      ...(body.label !== undefined ? { label: String(body.label).trim() } : {}),
      ...(body.fieldType !== undefined ? { fieldType: String(body.fieldType) } : {}),
      ...(body.options !== undefined ? { options: body.options } : {}),
      ...(body.required !== undefined ? { required: Boolean(body.required) } : {}),
      ...(body.helperText !== undefined ? { helperText: String(body.helperText).trim() } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    },
  });

  return NextResponse.json({ question });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.followUpFormQuestion.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
