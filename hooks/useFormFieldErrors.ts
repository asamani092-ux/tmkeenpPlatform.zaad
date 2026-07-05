"use client";

import { useCallback, useState } from "react";
import { getFormFieldErrors } from "@/lib/client-form-validation";

/** Track branded validation after submit — O(n) per validation */
export function useFormFieldErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((form: HTMLFormElement) => {
    const next = getFormFieldErrors(form);
    setErrors(next);
    return Object.keys(next).length === 0;
  }, []);

  const fieldError = useCallback((name: string) => errors[name], [errors]);

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, fieldError, clearErrors };
}
