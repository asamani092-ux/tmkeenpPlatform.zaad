import { NextResponse } from "next/server";
import {
  updateSession,
  deleteSession,
  markSessionAttended,
} from "@/lib/platform-service";
import { SessionStatus } from "@/generated/prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === "attend") {
      const rating = Number(body.commitmentRating);
      if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: "تقييم الالتزام مطلوب (1–5)" },
          { status: 400 }
        );
      }
      const result = await markSessionAttended({
        sessionId: id,
        commitmentRating: rating,
      });
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    const result = await updateSession({
      sessionId: id,
      date: body.date,
      notes: body.notes,
      status: body.status as SessionStatus | undefined,
      commitmentRating: body.commitmentRating,
      meetingLink: body.meetingLink,
      location: body.location,
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
    const result = await deleteSession(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
