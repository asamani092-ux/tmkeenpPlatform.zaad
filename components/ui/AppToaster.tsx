"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      dir="rtl"
      richColors
      closeButton
      expand
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "font-sans text-start shadow-lg border border-surface-border px-4 py-3",
          title: "font-bold text-primary",
          description: "text-brand-gray",
        },
      }}
    />
  );
}
