import fs from "fs";
import path from "path";
import { GuideClient } from "./GuideClient";

export const dynamic = 'force-dynamic';

export default async function PublicGuidePage() {
  let markdownContent = "";

  // 1. Ưu tiên đọc trực tiếp từ file doc.md ở thư mục gốc của dự án
  try {
    const rootDocPath = path.join(process.cwd(), "..", "..", "doc.md");
    if (fs.existsSync(rootDocPath)) {
      markdownContent = fs.readFileSync(rootDocPath, "utf-8");
    }
  } catch (err) {
    // Ignore error and fall back to local file
  }

  // 2. Nếu không đọc được file gốc (ví dụ trên môi trường deploy production Vercel), đọc từ guide-content.md nội bộ
  if (!markdownContent) {
    try {
      const localMdPath = path.join(process.cwd(), "src", "app", "guide", "guide-content.md");
      if (fs.existsSync(localMdPath)) {
        markdownContent = fs.readFileSync(localMdPath, "utf-8");
      }
    } catch (err) {
      console.warn("Lỗi khi đọc file guide-content.md local:", err);
    }
  }

  return <GuideClient markdownContent={markdownContent} />;
}
