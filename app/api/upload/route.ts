import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { savePdfFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") ?? "cv");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
    }

    const subdir = kind === "certificate" ? "certificates" : "cv";

    // Registration allows unauthenticated upload before account exists
    const isRegister = form.get("context") === "register";
    if (!isRegister && !session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session && session.role !== "BENEFICIARY" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const url = await savePdfFile(file, subdir);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل الرفع";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
