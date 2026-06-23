import { NextResponse } from "next/server";
import fs from "fs/promises";
import { getSession } from "@/lib/session";
import { resolveStoredFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { path: segments } = await params;
    const relative = segments.join("/");
    const fullPath = resolveStoredFile(relative);
    if (!fullPath) {
      return NextResponse.json({ error: "مسار غير صالح" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.role === "ADMIN" || session.role === "GUIDE") {
      // admins and guides can view beneficiary files
    } else if (session.role === "BENEFICIARY") {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { cvUrl: true, certificatesUrls: true },
      });
      const allowed = [user?.cvUrl, user?.certificatesUrls].filter(Boolean);
      const urls = allowed.flatMap((u) => {
        if (!u) return [];
        try {
          const parsed = JSON.parse(u);
          return Array.isArray(parsed) ? parsed : [u];
        } catch {
          return [u];
        }
      });
      if (!urls.some((u) => u.includes(relative))) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    try {
      const data = await fs.readFile(fullPath);
      return new NextResponse(data, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${segments.at(-1) ?? "file.pdf"}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch {
      return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
