import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSystemSettings, isValidEmail } from "@/lib/system-settings";
import { sendGenericEmail } from "@/lib/email-notify";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email || !isValidEmail(String(email))) {
    return NextResponse.json({ error: "بريد غير صالح" }, { status: 400 });
  }

  const settings = await getSystemSettings();
  await sendGenericEmail({
    to: String(email).trim(),
    subject: "رسالة تجريبية — منصة تمكين",
    body: [
      "مرحباً،",
      "",
      "هذه رسالة تجريبية من منصة تمكين للتحقق من إعدادات البريد.",
      "إذا وصلتك هذه الرسالة، فالإعدادات تعمل بشكل صحيح.",
      "",
      "مع تحيات فريق منصة تمكين",
    ].join("\n"),
    senderEmail: settings.senderEmail,
  });

  return NextResponse.json({ success: true });
}
