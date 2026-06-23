import { NextResponse } from "next/server";

/** Deprecated — use POST /api/stage-upgrade (sets pendingStage) instead */
export async function POST() {
  return NextResponse.json(
    { error: "هذا المسار معطّل. استخدم توصية المرحلة واعتماد المدير." },
    { status: 410 }
  );
}
