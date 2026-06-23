import { NextResponse } from "next/server";
import { resetPasswordByPhone } from "@/lib/platform-service";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();
    const result = await resetPasswordByPhone({
      phone: String(phone ?? ""),
      password: String(password ?? ""),
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
