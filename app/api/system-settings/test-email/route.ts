import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSystemSettings, isValidEmail } from "@/lib/system-settings";
import { sendGenericEmail } from "@/lib/email-notify";
import { describeSmtpError, getSmtpPublicInfo, isSmtpConfigured } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
    }

    const { email } = body;
    if (!email || !isValidEmail(String(email))) {
      return NextResponse.json({ error: "بريد غير صالح" }, { status: 400 });
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json(
        { error: "SMTP غير مفعّل — أضف SMTP_HOST و SMTP_USER و SMTP_PASS في البيئة" },
        { status: 502 }
      );
    }

    const settings = await getSystemSettings();
    const smtp = getSmtpPublicInfo();
    if (
      smtp.user &&
      settings.senderEmail.trim().toLowerCase() !== smtp.user.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error: `لـ Outlook يجب أن يساوي بريد المرسل SMTP_USER (${smtp.user})`,
        },
        { status: 400 }
      );
    }

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
  } catch (err) {
    console.error("[test-email]", err);
    return NextResponse.json({ error: describeSmtpError(err) }, { status: 502 });
  }
}
