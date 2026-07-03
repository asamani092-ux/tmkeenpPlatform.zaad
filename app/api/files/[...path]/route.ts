import { NextResponse } from "next/server";
import fs from "fs/promises";
import { getSession } from "@/lib/session";
import { resolveStoredFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ path: string[] }> };

function normalizeFileRelativePath(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const withoutApi = trimmed.replace(/^\/api\/files\//, "");
  if (withoutApi.includes("..")) return null;
  return withoutApi.replace(/^\/+/, "");
}

function collectFilePaths(cvUrl: string | null, certificatesUrls: string | null): string[] {
  const paths = new Set<string>();

  if (cvUrl) {
    const normalized = normalizeFileRelativePath(cvUrl);
    if (normalized) paths.add(normalized);
  }

  if (certificatesUrls) {
    let urls: string[] = [];
    try {
      const parsed = JSON.parse(certificatesUrls);
      urls = Array.isArray(parsed) ? parsed.map(String) : [certificatesUrls];
    } catch {
      urls = [certificatesUrls];
    }
    for (const url of urls) {
      const normalized = normalizeFileRelativePath(url);
      if (normalized) paths.add(normalized);
    }
  }

  return [...paths];
}

/** O(B) beneficiaries for guide — O(1) path check */
async function guideAllowedPaths(guideId: string): Promise<Set<string>> {
  const beneficiaries = await prisma.user.findMany({
    where: { role: "BENEFICIARY", guideId },
    select: { cvUrl: true, certificatesUrls: true },
  });

  const paths = new Set<string>();
  for (const b of beneficiaries) {
    for (const p of collectFilePaths(b.cvUrl, b.certificatesUrls)) {
      paths.add(p);
    }
  }
  return paths;
}

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

    if (session.role === "ADMIN") {
      // full access
    } else if (session.role === "GUIDE") {
      const allowed = await guideAllowedPaths(session.id);
      if (!allowed.has(relative)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }
    } else if (session.role === "BENEFICIARY") {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { cvUrl: true, certificatesUrls: true },
      });
      const allowed = collectFilePaths(user?.cvUrl ?? null, user?.certificatesUrls ?? null);
      if (!allowed.includes(relative)) {
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
