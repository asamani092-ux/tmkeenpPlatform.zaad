import { NextResponse } from "next/server";
import fs from "fs/promises";
import { getSession } from "@/lib/session";
import { resolveStoredFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ path: string[] }> };

/** Browser navigations get a readable Arabic page instead of raw JSON — O(1). */
function fileErrorResponse(
  request: Request,
  status: number,
  title: string,
  detail: string
): NextResponse {
  const wantsHtml = request.headers.get("accept")?.includes("text/html");
  if (!wantsHtml) {
    return NextResponse.json({ error: title }, { status });
  }
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="font-family:Tajawal,Tahoma,Arial,sans-serif;background:#f5f5f5;color:#3c3a3b;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:16px;text-align:center">
<div style="background:#fff;border:1px solid #d2d0d1;border-radius:14px;padding:32px;max-width:28rem">
<h1 style="color:#7b1e3a;font-size:20px;margin:0 0 8px">${title}</h1>
<p style="font-size:14px;line-height:1.8;margin:0">${detail}</p>
</div>
</body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

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

export async function GET(request: Request, { params }: Params) {
  try {
    const { path: segments } = await params;
    const relative = segments.join("/");
    const fullPath = resolveStoredFile(relative);
    if (!fullPath) {
      return NextResponse.json({ error: "مسار غير صالح" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return fileErrorResponse(
        request,
        401,
        "غير مصرح",
        "سجّل الدخول ثم أعد فتح الملف."
      );
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
      console.warn("[files] missing on disk:", relative, "→", fullPath);
      return fileErrorResponse(
        request,
        404,
        "الملف غير موجود",
        "الرابط سليم لكن الملف غير موجود على مخزن الخادم — غالباً فُقد لعدم ربط مجلد الرفع بتخزين دائم قبل آخر نشر. اطلب من المستفيد إعادة رفع الملف بعد تفعيل التخزين الدائم."
      );
    }
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
