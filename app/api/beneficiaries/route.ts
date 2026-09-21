import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isPlatformStaff } from "@/lib/roles";

/**
 * Search beneficiaries for opportunity targeting.
 * Time O(n) capped at 30 rows, Space O(k).
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !isPlatformStaff(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const idsRaw = url.searchParams.get("ids")?.trim() ?? "";
  const ids = idsRaw
    ? idsRaw.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 100)
    : [];

  const beneficiaries = await prisma.user.findMany({
    where: {
      role: "BENEFICIARY",
      ...(ids.length > 0 ? { id: { in: ids } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { skills: { contains: q, mode: "insensitive" } },
              { careerInterests: { contains: q, mode: "insensitive" } },
              { educationLevel: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      educationLevel: true,
      skills: true,
      careerInterests: true,
    },
    orderBy: { name: "asc" },
    take: ids.length > 0 ? ids.length : 30,
  });

  return NextResponse.json({ beneficiaries });
}
