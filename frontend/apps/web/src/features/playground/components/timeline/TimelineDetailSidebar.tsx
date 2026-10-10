'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import type { TimelineStep } from '@/lib/services/pipelineService'
import { ImageGallery } from '../payload/views/Shared'

interface TimelineDetailSidebarProps {
  currentStep: TimelineStep
  activeIdx: number
  totalSteps: number
  activeUnitIdx: number | null
  focusedSectionId: string | null
  onNavigateToHinhThanh: (uIdx: number, stepNum?: number) => void
  onNavigateToNode: (idx: number) => void
  onFocusAndScrollTo: (elementId: string) => void
  parsedMaterials: any[]
  subSteps?: Array<{ label: string; title: string }>
  steps?: string[]
  renderNote?: (idx: number) => React.ReactNode
  images?: any[]
}

export function TimelineDetailSidebar({
  currentStep: cur,
  activeUnitIdx,
  images
}: TimelineDetailSidebarProps) {
  const p = cur.nodePayload || {}
  const type = cur.type || ''

  // Xác định danh sách ảnh hiện tại dựa trên Node
  let currentImageIds: string[] = []
  
  if (type === 'Khởi động') {
    currentImageIds = p.used_image_ids || []
  } else if (type === 'Hình thành kiến thức' && p.knowledge_units) {
    const unit = p.knowledge_units[activeUnitIdx || 0] || {}
    currentImageIds = unit.used_image_ids || []
  }

  // Nếu không có ảnh thì không render gì cả hoặc render một thông báo nhỏ
  if (!currentImageIds || currentImageIds.length === 0) {
    return (
      <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4 sticky top-6 self-start">
         <div className="bg-slate-50 border border-slate-200 p-4 rounded-[var(--radius-xl)] flex items-center justify-center min-h-[100px]">
           <p className="text-xs text-slate-400 font-medium">Không có hình ảnh trực quan</p>
         </div>
      </aside>
    )
  }

  return (
    <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4 sticky top-6 self-start max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar">
      <div className="bg-[var(--color-neutral-200)] border border-[var(--color-neutral-300)] p-4 sm:p-5 rounded-[var(--radius-xl)] shadow-sm flex flex-col gap-3">
        
        {/* Header */}
        <div className="bg-[var(--color-primary-500)] text-white p-3.5 rounded-[var(--radius-lg)] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-primary-100)]" />
            <span className="font-header text-xs font-bold uppercase tracking-wider">
              Tư liệu trực quan
            </span>
          </div>
        </div>

        {/* Gallery Panel */}
        <div className="bg-white border-[3px] border-[var(--color-primary-300)] p-3 rounded-[var(--radius-lg)] shadow-xs">
          <ImageGallery usedImageIds={currentImageIds} images={images} layout="stack" />
        </div>
      </div>
    </aside>
  )
}
