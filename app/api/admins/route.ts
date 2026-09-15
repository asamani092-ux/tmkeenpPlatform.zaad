import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPlatformStaff, isSystemAdmin } from "@/lib/roles";
import { createAdmin, listSupervisors } from "@/lib/platform-service";

export async function GET() {
  const session = await getSession();
  if (!session || !isPlatformStaff(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const result = await listSupervisors();
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }
  return NextResponse.json({ supervisors: result.supervisors ?? [] });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isSystemAdmin(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await createAdmin(body);
    if (!result.success) {
      const status = result.error === "غير مصرح" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
