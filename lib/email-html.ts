/**
 * Shared Arabic RTL HTML email wrapper.
 * Time O(n) in body length, Space O(n).
 */

/** Escape HTML special chars — O(n). */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wrap plain Arabic body as RTL HTML email.
 * Preserves line breaks; highlights OTP-like codes (6 digits).
 */
export function wrapArabicEmailHtml(plainBody: string, title?: string): string {
  const safeTitle = escapeHtml(title?.trim() || "منصة تمكين");
  const paragraphs = plainBody
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => {
        const escaped = escapeHtml(line);
        // Emphasize OTP / verification codes: "الرمز: 123456"
        return escaped.replace(
          /(الرمز[:：]?\s*)(\d{4,8})/g,
          '$1<strong style="font-size:22px;letter-spacing:0.12em;color:#7b1e3a;" dir="ltr">$2</strong>'
        );
      });
      return `<p style="margin:0 0 14px;line-height:1.7;">${lines.join("<br/>")}</p>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;direction:rtl;text-align:right;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;direction:rtl;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;border:1px solid #e8e8e8;overflow:hidden;direction:rtl;text-align:right;">
          <tr>
            <td style="padding:18px 22px;background:#7b1e3a;color:#ffffff;font-family:Tahoma,'Segoe UI',Arial,sans-serif;font-size:18px;font-weight:700;">
              ${safeTitle}
            </td>
          </tr>
          <tr>
            <td style="padding:22px;color:#4e4b4d;font-family:Tahoma,'Segoe UI',Arial,sans-serif;font-size:15px;direction:rtl;text-align:right;">
              ${paragraphs}
            </td>
          </tr>
          <tr>
            <td style="padding:14px 22px 20px;color:#969294;font-family:Tahoma,'Segoe UI',Arial,sans-serif;font-size:12px;border-top:1px solid #eee;direction:rtl;text-align:right;">
              منصة تمكين — جمعية الزاد
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
