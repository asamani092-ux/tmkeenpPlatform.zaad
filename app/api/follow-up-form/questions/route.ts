import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { getQuestionsForMonth } from "@/lib/follow-up-form-templates";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const month = Number(new URL(request.url).searchParams.get("month") ?? "0");
  if (month >= 1 && month <= 6) {
    const questions = await getQuestionsForMonth(month);
    return NextResponse.json({ questions });
  }

  const questions = await prisma.followUpFormQuestion.findMany({
    orderBy: [{ month: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({ questions });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await request.json();
  const month = Number(body.month);
  if (month < 1 || month > 6) {
    return NextResponse.json({ error: "الشهر يجب أن يكون بين 1 و 6" }, { status: 400 });
  }

  const maxOrder = await prisma.followUpFormQuestion.aggregate({
    where: { month },
    _max: { sortOrder: true },
  });

  const question = await prisma.followUpFormQuestion.create({
    data: {
      month,
      label: String(body.label ?? "").trim(),
      fieldType: String(body.fieldType ?? "text"),
      options: Array.isArray(body.options) ? body.options : [],
      required: body.required !== false,
      helperText: String(body.helperText ?? "").trim(),
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json({ question });
}
