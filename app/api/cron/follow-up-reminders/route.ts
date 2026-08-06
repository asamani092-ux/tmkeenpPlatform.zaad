import { NextResponse } from "next/server";
import { processFollowUpReminders } from "@/lib/follow-up-service";

function authorizeCron(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret && headerSecret === expected) return true;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && auth.slice(7).trim() === expected) {
    return true;
  }

  return false;
}

async function runCron(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  await processFollowUpReminders();
  return NextResponse.json({ success: true });
}

/** Coolify/docs use GET + Authorization: Bearer */
export async function GET(request: Request) {
  return runCron(request);
}

/** Also accept POST + x-cron-secret */
export async function POST(request: Request) {
  return runCron(request);
}
