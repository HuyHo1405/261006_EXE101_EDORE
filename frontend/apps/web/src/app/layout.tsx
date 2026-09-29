import type { Metadata } from "next";
import { Mulish, IBM_Plex_Mono, Saira_Extra_Condensed } from "next/font/google";
// Token CSS import qua JS — Turbopack xử lý tốt hơn CSS @import
import "@edore/tokens/build/css/tokens.css";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { QueryProvider } from "@/lib/providers/query-provider";
import NextTopLoader from 'nextjs-toploader';

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
  title: "Edore — Nền tảng Hỗ trợ Giáo viên Chuẩn bị Kịch bản Giảng dạy",
  description:
    "Edore là nền tảng ed-tech giúp giáo viên tự động phân tích tài liệu và biên soạn kịch bản bài giảng thông minh.",
  icons: {
    icon: "/edore_logo.png",
    shortcut: "/edore_logo.png",
    apple: "/edore_logo.png",
  },
  openGraph: {
    title: "Edore — Nền tảng Hỗ trợ Giáo viên Chuẩn bị Kịch bản Giảng dạy",
    description:
      "Edore là nền tảng ed-tech giúp giáo viên tự động phân tích tài liệu và biên soạn kịch bản bài giảng thông minh.",
    images: [
      {
        url: "/edore_logo.png",
        width: 512,
        height: 512,
        alt: "Edore Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edore — Nền tảng Hỗ trợ Giáo viên Chuẩn bị Kịch bản Giảng dạy",
    description:
      "Edore là nền tảng ed-tech giúp giáo viên tự động phân tích tài liệu và biên soạn kịch bản bài giảng thông minh.",
    images: ["/edore_logo.png"],
  },
};

import { ToastContainer } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${sairaExtraCondensed.variable} ${mulish.variable} ${ibmPlexMono.variable}`}>
      <head>

        <link rel="apple-touch-icon" href="/edore_logo.png" />
      </head>
      <body className="flex flex-col min-h-screen">
        <NextTopLoader color="#034ce4" showSpinner={false} shadow="0 0 10px #034ce4,0 0 5px #034ce4" height={3} />
        <QueryProvider>
          <ToastContainer />
          <LayoutShell>{children}</LayoutShell>
        </QueryProvider>
      </body>
    </html>
  );
}
