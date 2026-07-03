import { prisma } from "@/lib/prisma";

/** O(T) templates scan, O(1) match per month — fallback O(Q) legacy month query */
export async function getQuestionsForMonth(month: number) {
  const templates = await prisma.followUpFormTemplate.findMany({
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const template = templates.find((t) => {
    const months = Array.isArray(t.months) ? (t.months as number[]) : [];
    return months.includes(month);
  });

  if (template) {
    return template.questions;
  }

  return prisma.followUpFormQuestion.findMany({
    where: { month },
    orderBy: { sortOrder: "asc" },
  });
}

export function parseTemplateMonths(months: unknown): number[] {
  if (!Array.isArray(months)) return [];
  return months
    .map((m) => Number(m))
    .filter((m) => m >= 1 && m <= 6)
    .sort((a, b) => a - b);
}

export function serializeTemplate(template: {
  id: string;
  title: string;
  months: unknown;
  createdAt: Date;
  updatedAt: Date;
  questions?: Array<{
    id: string;
    label: string;
    fieldType: string;
    options: unknown;
    sortOrder: number;
    required: boolean;
    helperText: string;
    month: number;
  }>;
}) {
  return {
    id: template.id,
    title: template.title,
    months: parseTemplateMonths(template.months),
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    questions: (template.questions ?? []).map((q) => ({
      id: q.id,
      label: q.label,
      fieldType: q.fieldType,
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      sortOrder: q.sortOrder,
      required: q.required,
      helperText: q.helperText,
      month: q.month,
    })),
  };
}
