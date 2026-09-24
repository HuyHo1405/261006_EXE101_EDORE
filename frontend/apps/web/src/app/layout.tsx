import type { Metadata } from "next";
import { Mulish, IBM_Plex_Mono, Saira_Extra_Condensed } from "next/font/google";
// Token CSS import qua JS — Turbopack xử lý tốt hơn CSS @import
import "@edore/tokens/build/css/tokens.css";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { QueryProvider } from "@/lib/providers/query-provider";

const sairaExtraCondensed = Saira_Extra_Condensed({
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800"],
  variable: "--font-saira",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-mulish",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Edore — Nền tảng học tập",
  description:
    "Edore là nền tảng ed-tech giúp giáo viên soạn bài giảng và học sinh quản lý lịch học hiệu quả.",
};

import { ToastContainer } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${sairaExtraCondensed.variable} ${mulish.variable} ${ibmPlexMono.variable}`}>
      <body className="flex flex-col min-h-screen">
        <QueryProvider>
          <ToastContainer />
          <LayoutShell>{children}</LayoutShell>
        </QueryProvider>
      </body>
    </html>
  );
}
