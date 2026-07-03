import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  parseTemplateMonths,
  serializeTemplate,
} from "@/lib/follow-up-form-templates";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const templates = await prisma.followUpFormTemplate.findMany({
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    templates: templates.map(serializeTemplate),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const months = parseTemplateMonths(body.months);

  if (!title) {
    return NextResponse.json({ error: "عنوان النموذج مطلوب" }, { status: 400 });
  }
  if (months.length === 0) {
    return NextResponse.json({ error: "اختر شهراً واحداً على الأقل" }, { status: 400 });
  }

  const questions = Array.isArray(body.questions) ? body.questions : [];

  const template = await prisma.$transaction(async (tx) => {
    const created = await tx.followUpFormTemplate.create({
      data: {
        title,
        months,
      },
    });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await tx.followUpFormQuestion.create({
        data: {
          formId: created.id,
          month: months[0],
          label: String(q.label ?? "").trim(),
          fieldType: String(q.fieldType ?? "text"),
          options: Array.isArray(q.options) ? q.options : [],
          required: q.required !== false,
          helperText: String(q.helperText ?? "").trim(),
          sortOrder: i,
        },
      });
    }

    return tx.followUpFormTemplate.findUnique({
      where: { id: created.id },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    });
  });

  if (!template) {
    return NextResponse.json({ error: "فشل الإنشاء" }, { status: 500 });
  }

  return NextResponse.json({ template: serializeTemplate(template) });
}
