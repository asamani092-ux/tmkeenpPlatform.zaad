"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      dir="rtl"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "font-sans text-right",
        },
      }}
    />
  );
}
