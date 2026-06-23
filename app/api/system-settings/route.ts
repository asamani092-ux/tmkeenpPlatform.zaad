import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getSystemSettings,
  saveSystemSettings,
  isValidEmail,
} from "@/lib/system-settings";
import { isSmtpConfigured } from "@/lib/mail";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const settings = await getSystemSettings();
  return NextResponse.json({ ...settings, smtpConfigured: isSmtpConfigured() });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const senderEmail = String(body.senderEmail ?? "").trim();

    if (!senderEmail) {
      return NextResponse.json(
        { error: "البريد الإلكتروني للمرسل مطلوب" },
        { status: 400 }
      );
    }

    if (!isValidEmail(senderEmail)) {
      return NextResponse.json(
        { error: "صيغة البريد الإلكتروني غير صالحة" },
        { status: 400 }
      );
    }

    await saveSystemSettings({ senderEmail });
    return NextResponse.json({ success: true, senderEmail });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
