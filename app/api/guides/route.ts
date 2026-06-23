import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createGuide } from "@/lib/platform-service";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const guides = await prisma.user.findMany({
    where: { role: "GUIDE" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { beneficiaries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ guides });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createGuide(body);
    if (!result.success) {
      const status = result.error === "غير مصرح" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
