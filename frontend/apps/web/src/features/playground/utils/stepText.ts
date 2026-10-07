/** Tách một dòng "bước" thành tiêu đề ngắn + mô tả. */
export function splitStepText(raw: string): { title: string; desc: string } {
  let t = (raw || '').trim()
  // bỏ tiền tố "Bước 1:", "1.", "-", "*"
  t = t.replace(/^(Bước\s+\d+|\d+[.)]|[-*•])\s*[:.\-–]?\s*/i, '').trim()
  if (!t) return { title: '', desc: '' }

  // **Tiêu đề**: mô tả
  const bold = t.match(/^\*\*(.+?)\*\*\s*[:\-–—]?\s*(.*)$/)
  if (bold) return { title: bold[1].trim(), desc: bold[2].trim() }

  // Tiêu đề ngắn: mô tả
  const sep = t.match(/^(.{3,60}?)\s*(?::|\s[–—-]\s)\s*(.+)$/)
  if (sep) return { title: sep[1].replace(/\*\*/g, '').trim(), desc: sep[2].trim() }

  const plain = t.replace(/\*\*/g, '')
  if (plain.length <= 60) return { title: plain, desc: '' }

  // Câu dài: lấy vài từ đầu làm tiêu đề, giữ nguyên câu làm mô tả
  const words = plain.split(/\s+/)
  const title = words.slice(0, 8).join(' ') + '…'
  return { title, desc: plain }
}

export type MaterialKind = 'device' | 'tool' | 'document' | 'other'

export interface MaterialInfo {
  kind: MaterialKind
  label: string
}

const MATERIAL_RULES: { kind: MaterialKind; label: string; re: RegExp }[] = [
  {
    kind: 'device',
    label: 'Thiết bị',
    re: /(máy chiếu|projector|slide|laptop|máy tính|tivi|tv|loa|micro|điện thoại|tablet|ipad|wifi|internet|camera|tai nghe|màn hình|phần mềm|app|website|geogebra)/i,
  },
  {
    kind: 'document',
    label: 'Tài liệu',
    re: /(phiếu|bài tập|tài liệu|sgk|sách|giáo trình|video|clip|hình ảnh|tranh|poster|đề|thẻ|card|quiz|bảng hỏi)/i,
  },
  {
    kind: 'tool',
    label: 'Dụng cụ',
    re: /(giấy|bút|thước|kéo|keo|màu|bảng|phấn|nam châm|compa|êke|mô hình|vật mẫu|dụng cụ|post-?it|sticker|băng dính)/i,
  },
]

export function classifyMaterial(title: string): MaterialInfo {
  for (const r of MATERIAL_RULES) if (r.re.test(title)) return { kind: r.kind, label: r.label }
  return { kind: 'other', label: 'Vật tư' }
}

export interface ParsedMaterial {
  title: string
  desc: string
}

export function parseMaterials(raw: string | string[] | undefined | null): ParsedMaterial[] {
  const text = Array.isArray(raw) ? raw.join('\n') : raw || ''
  return text
    .split('\n')
    .map(l => l.replace(/^([-*+]\s*|\d+\.\s*|Chuẩn bị:\s*)/i, '').trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/\s*(?::|\s[–—-]\s)\s*(.*)/)
      if (parts.length >= 2 && parts[1]?.trim()) return { title: parts[0].trim(), desc: parts[1].trim() }
      return { title: line, desc: '' }
    })
}
