import fs from "fs/promises";

import path from "path";

import { sendMail, isSmtpConfigured } from "@/lib/mail";



const LOG_DIR = path.join(process.cwd(), "data");

const LOG_PATH = path.join(LOG_DIR, "email-log.json");



export type SessionEmailParams = {

  beneficiaryEmail: string;

  beneficiaryName: string;

  guideEmail: string;

  guideName: string;

  sessionDate: Date;

  meetingLink?: string | null;

  location?: string | null;

  senderEmail: string;

};



export type GenericEmailParams = {

  to: string;

  subject: string;

  body: string;

  senderEmail: string;

};



type EmailPayload = { to: string; subject: string; body: string };



function buildSessionEmail(

  params: SessionEmailParams,

  recipient: "beneficiary" | "guide"

): EmailPayload {

  const dateStr = params.sessionDate.toLocaleString("ar-SA");

  const linkOrLocation = params.meetingLink

    ? `رابط الجلسة: ${params.meetingLink}`

    : params.location

      ? `موقع الجلسة: ${params.location}`

      : "";



  if (recipient === "beneficiary") {

    return {

      to: params.beneficiaryEmail,

      subject: "تم جدولة جلسة إرشاد جديدة",

      body: [

        `مرحباً ${params.beneficiaryName}،`,

        "",

        `تم جدولة جلسة إرشاد مع المرشد ${params.guideName} في ${dateStr}.`,

        linkOrLocation,

        "",

        "مع تحيات فريق منصة تمكين",

      ]

        .filter(Boolean)

        .join("\n"),

    };

  }



  return {

    to: params.guideEmail,

    subject: "تأكيد جدولة جلسة إرشاد",

    body: [

      `مرحباً ${params.guideName}،`,

      "",

      `تم جدولة جلسة إرشاد مع المستفيد ${params.beneficiaryName} في ${dateStr}.`,

      linkOrLocation,

      "",

      "مع تحيات فريق منصة تمكين",

    ]

      .filter(Boolean)

      .join("\n"),

  };

}



async function logEmails(from: string, emails: EmailPayload[]): Promise<void> {

  try {

    await fs.mkdir(LOG_DIR, { recursive: true });

    let log: unknown[] = [];

    try {

      const raw = await fs.readFile(LOG_PATH, "utf-8");

      const parsed = JSON.parse(raw);

      log = Array.isArray(parsed) ? parsed : [];

    } catch {

      log = [];

    }

    log.push({ timestamp: new Date().toISOString(), from, emails });

    await fs.writeFile(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");

  } catch (err) {

    console.error("[EMAIL LOG ERROR]", err);

  }

}



async function dispatch(from: string, emails: EmailPayload[]): Promise<void> {

  for (const email of emails) {

    if (isSmtpConfigured()) {

      await sendMail({ from, to: email.to, subject: email.subject, text: email.body });

    } else {

      console.log("[EMAIL SIMULATION]", { from, ...email });

    }

  }

  await logEmails(from, emails);

}



/** Session scheduled emails — O(1) */

export async function sendSessionScheduledEmails(

  params: SessionEmailParams

): Promise<void> {

  const emails = [

    buildSessionEmail(params, "beneficiary"),

    buildSessionEmail(params, "guide"),

  ];

  await dispatch(params.senderEmail, emails);

}



/** Follow-up form reminder — O(1) */
export async function sendFollowUpFormReminderEmail(params: {
  to: string;
  name: string;
  month: number;
  dashboardUrl: string;
  senderEmail: string;
}): Promise<void> {
  await dispatch(params.senderEmail, [
    {
      to: params.to,
      subject: `نموذج متابعة الشهر ${params.month} — منصة تمكين`,
      body: [
        `مرحباً ${params.name}،`,
        "",
        `نموذج متابعة ما بعد التوظيف للشهر ${params.month} متاح الآن.`,
        `يُرجى الدخول إلى المنصة وإكمال النموذج: ${params.dashboardUrl}`,
        "",
        "مع تحيات فريق منصة تمكين",
      ].join("\n"),
    },
  ]);
}

/** Generic notification email — O(1) */

export async function sendGenericEmail(params: GenericEmailParams): Promise<void> {

  await dispatch(params.senderEmail, [

    { to: params.to, subject: params.subject, body: params.body },

  ]);

}


