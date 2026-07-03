import { NextResponse } from "next/server";
import {
  updateTask,
  deleteTask,
  setTaskCompletion,
} from "@/lib/platform-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: { isCompleted?: boolean; title?: string; description?: string } = {};
    try {
      const text = await request.text();
      if (text.trim()) body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
    }

    if (body.isCompleted !== undefined) {
      const result = await setTaskCompletion(id, Boolean(body.isCompleted));
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (body.title !== undefined || body.description !== undefined) {
      const result = await updateTask({
        taskId: id,
        title: body.title,
        description: body.description,
      });
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "لا توجد بيانات للتحديث" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteTask(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
