import { NextResponse } from "next/server";
import {
  updateTask,
  deleteTask,
  toggleTaskCompletion,
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

    if (body.isCompleted !== undefined || Object.keys(body).length === 0) {
      const result = await toggleTaskCompletion(id);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    const result = await updateTask({
      taskId: id,
      title: body.title,
      description: body.description,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
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
