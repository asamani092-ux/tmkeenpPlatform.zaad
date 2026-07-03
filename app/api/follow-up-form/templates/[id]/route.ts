import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  parseTemplateMonths,
  serializeTemplate,
} from "@/lib/follow-up-form-templates";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const title = body.title != null ? String(body.title).trim() : undefined;
  const months =
    body.months != null ? parseTemplateMonths(body.months) : undefined;

  if (title !== undefined && !title) {
    return NextResponse.json({ error: "عنوان النموذج مطلوب" }, { status: 400 });
  }
  if (months !== undefined && months.length === 0) {
    return NextResponse.json({ error: "اختر شهراً واحداً على الأقل" }, { status: 400 });
  }

  const existing = await prisma.followUpFormTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "النموذج غير موجود" }, { status: 404 });
  }

  const template = await prisma.$transaction(async (tx) => {
    await tx.followUpFormTemplate.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(months !== undefined ? { months } : {}),
      },
    });

    if (Array.isArray(body.questions)) {
      await tx.followUpFormQuestion.deleteMany({ where: { formId: id } });
      const resolvedMonths = months ?? parseTemplateMonths(existing.months);
      const primaryMonth = resolvedMonths[0] ?? 1;

      for (let i = 0; i < body.questions.length; i++) {
        const q = body.questions[i];
        await tx.followUpFormQuestion.create({
          data: {
            formId: id,
            month: primaryMonth,
            label: String(q.label ?? "").trim(),
            fieldType: String(q.fieldType ?? "text"),
            options: Array.isArray(q.options) ? q.options : [],
            required: q.required !== false,
            helperText: String(q.helperText ?? "").trim(),
            sortOrder: i,
          },
        });
      }
    }

    return tx.followUpFormTemplate.findUnique({
      where: { id },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    });
  });

  if (!template) {
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }

  return NextResponse.json({ template: serializeTemplate(template) });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.followUpFormTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "النموذج غير موجود" }, { status: 404 });
  }

  await prisma.followUpFormTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
