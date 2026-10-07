import type { TimelineStep } from '@/lib/services/pipelineService'

export interface ActivitySubStep {
  idx: number
  label: string
  title: string
  raw: string
}

export function getShortNodeName(step: TimelineStep, idx: number): string {
  const l = (step.type || '').toLowerCase()
  if (l.includes('khởi động') || l.includes('warm')) return 'Khởi động'
  if (l.includes('lý thuyết') || l.includes('core')) return 'Lý thuyết'
  if (l.includes('thực hành') || l.includes('practice')) return 'Thực hành'
  return step.type || `Phần ${idx + 1}`
}

export function parseActivitySubSteps(detailsRaw: string[] | string): ActivitySubStep[] {
  const lines = Array.isArray(detailsRaw)
    ? detailsRaw
    : (detailsRaw || '').split('\n')

  const validLines = lines.map(l => l.trim()).filter(Boolean)

  if (validLines.length === 0) {
    return [
      { idx: 0, label: '1.', title: 'Giáo viên chia lớp & Dẫn nhập bài học', raw: '1. Giáo viên chia lớp & Dẫn nhập bài học' },
      { idx: 1, label: '2.', title: 'Học sinh thực hiện nội dung & thảo luận', raw: '2. Học sinh thực hiện nội dung & thảo luận' },
      { idx: 2, label: '3.', title: 'Tổng kết & Đánh giá kết quả', raw: '3. Tổng kết & Đánh giá kết quả' },
    ]
  }

  return validLines.map((line, idx) => {
    const m = line.match(/^(Bước\s+\d+|[0-9]+\.|-|\*)\s*[:.-]?\s*(.*)$/i)
    if (m) {
      return {
        idx,
        label: `${idx + 1}.`,
        title: m[2] || line,
        raw: line,
      }
    }
    return {
      idx,
      label: `${idx + 1}.`,
      title: line,
      raw: `${idx + 1}. ${line}`,
    }
  })
}
