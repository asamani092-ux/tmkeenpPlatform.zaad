import { NextResponse } from "next/server";
import { scheduleSession } from "@/lib/platform-service";

export async function POST(request: Request) {
  try {
    const { beneficiaryId, date, notes, meetingLink, location } =
      await request.json();
    if (!beneficiaryId || !date) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const result = await scheduleSession({
      beneficiaryId: String(beneficiaryId),
      date: String(date),
      notes: String(notes ?? ""),
      meetingLink: meetingLink != null ? String(meetingLink) : undefined,
      location: location != null ? String(location) : undefined,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: result.session.id,
        date: result.session.date.toISOString(),
        status: result.session.status,
        notes: result.session.notes,
        meetingLink: result.session.meetingLink,
        location: result.session.location,
        commitmentRating: result.session.commitmentRating,
      },
    });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
