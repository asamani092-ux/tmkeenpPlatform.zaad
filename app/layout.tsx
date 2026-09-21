import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import AppToaster from "@/components/ui/AppToaster";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة التمكين المستدام | جمعية الزاد",
  description:
    "منصة لإدارة رحلة الخريجين نحو التوظيف — جمعية الزاد",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-mark.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-theme="light">
      <body className={`${tajawal.className} zad-root min-h-screen antialiased`}>
        <AppToaster />
        {children}
      </body>
    </html>
  );
}
