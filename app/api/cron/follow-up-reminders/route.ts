import { NextResponse } from "next/server";
import { processFollowUpReminders } from "@/lib/follow-up-service";

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const secret = request.headers.get("x-cron-secret");
  if (secret !== expected) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  await processFollowUpReminders();
  return NextResponse.json({ success: true });
}
