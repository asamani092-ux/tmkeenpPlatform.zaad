/** Collect required-field errors after submit — Time O(n) fields, Space O(n) errors */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Saudi mobile: 05xxxxxxxx / +9665xxxxxxxx / 9665xxxxxxxx */
const PHONE_RE = /^(05\d{8}|\+9665\d{8}|9665\d{8})$/;

function normalizePhone(value: string) {
  return value.replace(/[\s\-()]/g, "");
}

export function isValidRegisterPhone(value: string): boolean {
  return PHONE_RE.test(normalizePhone(value));
}

export function isValidRegisterEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function getFormFieldErrors(form: HTMLFormElement): Record<string, string> {
  const errors: Record<string, string> = {};
  const fields = form.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");

  for (const field of fields) {
    if (!field.required || field.disabled) continue;
    const key = field.name || field.id;
    if (!key) continue;

    if (field instanceof HTMLInputElement && field.type === "file") {
      if (!field.files || field.files.length === 0) {
        errors[key] = "هذا الحقل مطلوب";
      } else {
        const file = field.files[0];
        const isPdf =
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
          errors[key] = "يُقبل ملف PDF فقط";
        }
      }
      continue;
    }

    const value =
      field instanceof HTMLInputElement && field.type === "checkbox"
        ? field.checked
          ? "1"
          : ""
        : field.value.trim();

    if (!value) {
      errors[key] = "هذا الحقل مطلوب";
      continue;
    }

    if (
      (field.type === "email" || field.name === "email" || field.id === "email") &&
      !isValidRegisterEmail(value)
    ) {
      errors[key] = "أدخل بريداً إلكترونياً صالحاً";
      continue;
    }

    if (
      (field.type === "tel" || field.name === "phone" || field.id === "phone") &&
      !isValidRegisterPhone(value)
    ) {
      errors[key] = "أدخل رقم جوال سعودي صالحاً (مثال: 05xxxxxxxx)";
      continue;
    }

    if (field.type === "password" && field.minLength > 0 && value.length < field.minLength) {
      errors[key] = `كلمة المرور يجب أن تكون ${field.minLength} أحرف على الأقل`;
    }
  }

  return errors;
}

export function inputInvalidClass(hasError: boolean): string {
  return hasError ? "border-red-800 ring-2 ring-red-800/25" : "";
}
