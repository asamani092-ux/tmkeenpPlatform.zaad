/** Collect required-field errors after submit — O(n) fields */
export function getFormFieldErrors(form: HTMLFormElement): Record<string, string> {
  const errors: Record<string, string> = {};
  const fields = form.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");

  for (const field of fields) {
    if (!field.required || field.disabled) continue;
    const key = field.name || field.id;
    if (!key) continue;

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

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[key] = "أدخل بريداً إلكترونياً صالحاً";
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
