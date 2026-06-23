import type { Metadata } from "next";
import AppToaster from "@/components/ui/AppToaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة التمكين المستدام | جمعية الزاد",
  description:
    "منصة لإدارة رحلة الخريجين نحو التوظيف — جمعية الزاد",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen font-sans antialiased">
        <AppToaster />
        {children}
      </body>
    </html>
  );
}
