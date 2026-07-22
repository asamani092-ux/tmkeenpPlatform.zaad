import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { isValidEmailFormat } from "@/lib/email-format";
import { getSystemSettings } from "@/lib/system-settings";
import { sendRegistrationOtpEmail } from "@/lib/email-notify";
import { isSmtpConfigured } from "@/lib/mail";

type ActionResult = { success: true } | { success: false; error: string };

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export type RegisterPayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  educationLevel: string;
  experience: string;
  skills: string;
  careerInterests: string;
  cvUrl: string;
  certificatesUrls: string;
};

type StoredPayload = Omit<RegisterPayload, "password"> & {
  passwordHash: string;
};

function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function normalizePhone(phone: string) {
  return phone.replace(/[\s\-()]/g, "");
}

/** Validate registration fields — Time O(1), Space O(1) */
export function validateRegisterPayload(
  data: RegisterPayload
): ActionResult {
  if (
    !data.name.trim() ||
    !data.phone.trim() ||
    !data.email.trim() ||
    !data.password ||
    !data.educationLevel.trim() ||
    !data.experience.trim() ||
    !data.skills.trim() ||
    !data.careerInterests.trim() ||
    !data.cvUrl.trim() ||
    !data.certificatesUrls.trim()
  ) {
    return { success: false, error: "جميع الحقول مطلوبة" };
  }
  if (data.password.length < 6) {
    return { success: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
  }
  const email = data.email.toLowerCase().trim();
  if (!isValidEmailFormat(email)) {
    return { success: false, error: "البريد الإلكتروني غير صالح" };
  }
  const phone = normalizePhone(data.phone);
  if (!/^(05\d{8}|\+9665\d{8}|9665\d{8})$/.test(phone)) {
    return { success: false, error: "رقم الجوال غير صالح" };
  }
  return { success: true };
}

/**
 * Start registration: store challenge + email OTP.
 * Time O(1) DB + email; Space O(1) payload.
 */
export async function startRegistrationChallenge(
  data: RegisterPayload
): Promise<ActionResult & { challengeId?: string; previewCode?: string }> {
  const basic = validateRegisterPayload(data);
  if (!basic.success) return basic;

  const email = data.email.toLowerCase().trim();
  const phone = normalizePhone(data.phone);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
  }

  const passwordHash = await hashPassword(data.password);
  const code = String(randomInt(100000, 1000000));
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const stored: StoredPayload = {
    name: data.name.trim(),
    phone,
    email,
    passwordHash,
    educationLevel: data.educationLevel.trim(),
    experience: data.experience.trim(),
    skills: data.skills.trim(),
    careerInterests: data.careerInterests.trim(),
    cvUrl: data.cvUrl.trim(),
    certificatesUrls: data.certificatesUrls.trim(),
  };

  await prisma.registrationChallenge.deleteMany({ where: { email } });
  const challenge = await prisma.registrationChallenge.create({
    data: {
      email,
      codeHash,
      payloadJson: JSON.stringify(stored),
      expiresAt,
    },
  });

  if (!isSmtpConfigured() && process.env.NODE_ENV === "production") {
    await prisma.registrationChallenge.delete({ where: { id: challenge.id } });
    return {
      success: false,
      error: "خدمة البريد غير مفعّلة — تعذر إرسال رمز التحقق",
    };
  }

  const settings = await getSystemSettings();
  try {
    await sendRegistrationOtpEmail({
      to: email,
      name: stored.name,
      code,
      senderEmail: settings.senderEmail,
    });
  } catch (err) {
    console.warn("[register-otp] send failed:", err);
    await prisma.registrationChallenge.delete({ where: { id: challenge.id } });
    return {
      success: false,
      error: "تعذر إرسال رمز التحقق إلى البريد. حاول لاحقاً.",
    };
  }

  if (!isSmtpConfigured()) {
    console.log(`[register-otp] SMTP off — code for ${email}: ${code}`);
  }

  return {
    success: true,
    challengeId: challenge.id,
    ...(process.env.NODE_ENV !== "production" ? { previewCode: code } : {}),
  };
}

/**
 * Verify OTP and create beneficiary — Time O(1), Space O(1).
 */
export async function verifyRegistrationChallenge(
  challengeId: string,
  code: string
): Promise<ActionResult> {
  const id = challengeId.trim();
  const otp = code.trim();
  if (!id || !/^\d{6}$/.test(otp)) {
    return { success: false, error: "رمز التحقق غير صالح" };
  }

  const challenge = await prisma.registrationChallenge.findUnique({
    where: { id },
  });
  if (!challenge) {
    return { success: false, error: "انتهت صلاحية طلب التسجيل. أعد المحاولة." };
  }
  if (challenge.expiresAt.getTime() < Date.now()) {
    await prisma.registrationChallenge.delete({ where: { id } }).catch(() => {});
    return { success: false, error: "انتهت صلاحية رمز التحقق. أعد التسجيل." };
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    await prisma.registrationChallenge.delete({ where: { id } }).catch(() => {});
    return { success: false, error: "تجاوزت عدد المحاولات. أعد التسجيل." };
  }

  if (challenge.codeHash !== hashOtp(otp)) {
    await prisma.registrationChallenge.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
    return { success: false, error: "رمز التحقق غير صحيح" };
  }

  let payload: StoredPayload;
  try {
    payload = JSON.parse(challenge.payloadJson) as StoredPayload;
  } catch {
    return { success: false, error: "بيانات التسجيل تالفة. أعد المحاولة." };
  }

  const { registerBeneficiaryFromVerifiedPayload } = await import(
    "@/lib/platform-service"
  );
  const result = await registerBeneficiaryFromVerifiedPayload(payload);
  if (result.success) {
    await prisma.registrationChallenge.delete({ where: { id } }).catch(() => {});
  }
  return result;
}
