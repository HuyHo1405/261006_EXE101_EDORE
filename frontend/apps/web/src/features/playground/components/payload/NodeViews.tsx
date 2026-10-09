'use client'
import type { ReactNode } from 'react'
import { normalizeNodeType } from '../../utils/stepEnrichment'
import { KhoiDongView } from './views/KhoiDongView'
import { HinhThanhView } from './views/HinhThanhView'
import { LuyenTapView } from './views/LuyenTapView'
import { VanDungView } from './views/VanDungView'
import { StepList, MaterialList } from './views/Shared'
export { MaterialList }

// ─── Entry ────────────────────────────────────────────────────────────────────
export function NodeBody({
  nodeTypeCode, nodeType, payload, onPayloadChange, steps, renderNote, teachingMethod, onTeachingMethodChange,
  appliedActivity, intent, onGoToNextNode, nextStepTitle, teachingTools, pedagogNote, hinhThanhApproach, activeUnitIdx
}: {
  nodeTypeCode?: string
  nodeType?: string
  payload: any
  onPayloadChange: (p: any) => void
  steps: string[]
  renderNote?: (idx: number) => ReactNode
  teachingMethod?: string
  onTeachingMethodChange?: (m: string) => void
  appliedActivity?: string
  intent?: string
  onGoToNextNode?: () => void
  nextStepTitle?: string
  teachingTools?: any[]
  pedagogNote?: any
  hinhThanhApproach?: string
  activeUnitIdx?: number
}) {
  const kind = normalizeNodeType(nodeTypeCode) || normalizeNodeType(nodeType)
  const key = kind && ['KHOI_DONG', 'HINH_THANH_KIEN_THUC', 'LUYEN_TAP', 'VAN_DUNG'].includes(kind)
    ? kind
    : normalizeNodeType(nodeType)

  const hasPayload = payload && typeof payload === 'object' && Object.keys(payload).length > 0

  if (key === 'KHOI_DONG' && hasPayload) {
    return (
      <KhoiDongView
        payload={payload}
        onChange={onPayloadChange}
        steps={steps}
        renderNote={renderNote}
        appliedActivity={appliedActivity}
        intent={intent}
        onGoToNextNode={onGoToNextNode}
        nextStepTitle={nextStepTitle}
        teachingTools={teachingTools}
        pedagogNote={pedagogNote}
        hinhThanhApproach={hinhThanhApproach}
      />
    )
  }

  if (key === 'HINH_THANH_KIEN_THUC' && hasPayload) {
    return (
      <HinhThanhView
        activeUnitIdx={activeUnitIdx}
        payload={payload}
        onChange={onPayloadChange}
        steps={steps}
        renderNote={renderNote}
        teachingMethod={teachingMethod}
        onTeachingMethodChange={onTeachingMethodChange}
        appliedActivity={appliedActivity}
        teachingTools={teachingTools}
        pedagogNote={pedagogNote}
        onGoToNextNode={onGoToNextNode}
        nextStepTitle={nextStepTitle}
      />
    )
  }

  return (
    <div className="space-y-5">
      {hasPayload && key === 'LUYEN_TAP' && <LuyenTapView payload={payload} onChange={onPayloadChange} />}
      {hasPayload && key === 'VAN_DUNG' && <VanDungView payload={payload} onChange={onPayloadChange} />}
      {(!hasPayload || (key !== 'LUYEN_TAP' && key !== 'VAN_DUNG')) && (
        <StepList steps={steps} renderNote={renderNote} />
      )}
    </div>
  )
}
