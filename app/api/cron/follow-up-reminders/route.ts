import { NextResponse } from "next/server";
import { processFollowUpReminders } from "@/lib/follow-up-service";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  await processFollowUpReminders();
  return NextResponse.json({ success: true });
}
