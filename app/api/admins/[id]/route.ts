import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isSystemAdmin } from "@/lib/roles";
import { updateAdmin, deleteAdmin } from "@/lib/platform-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || !isSystemAdmin(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateAdmin(id, body);
    if (!result.success) {
      const status = result.error === "غير مصرح" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || !isSystemAdmin(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const result = await deleteAdmin(id);
    if (!result.success) {
      const status = result.error === "غير مصرح" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
