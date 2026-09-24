'use client'

import React from 'react'
import { normalizeNodeType } from '../../types/nodePayload'
import { KhoiDongPayloadBuilder } from './KhoiDongPayloadBuilder'
import { HinhThanhPayloadBuilder } from './HinhThanhPayloadBuilder'
import { LuyenTapPayloadBuilder } from './LuyenTapPayloadBuilder'
import { VanDungPayloadBuilder } from './VanDungPayloadBuilder'

interface NodePayloadFactoryProps {
  nodeType?: string
  payload?: any
  onChange?: (updatedPayload: any) => void
  readOnly?: boolean
}

export function NodePayloadFactory({
  nodeType,
  payload,
  onChange,
  readOnly = false,
}: NodePayloadFactoryProps) {
  if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
    return null
  }

  const normalized = normalizeNodeType(nodeType)

  switch (normalized) {
    case 'KHOI_DONG':
      return <KhoiDongPayloadBuilder payload={payload} onChange={onChange} readOnly={readOnly} />

    case 'HINH_THANH_KIEN_THUC':
      return <HinhThanhPayloadBuilder payload={payload} onChange={onChange} readOnly={readOnly} />

    case 'LUYEN_TAP':
      return <LuyenTapPayloadBuilder payload={payload} onChange={onChange} readOnly={readOnly} />

    case 'VAN_DUNG':
      return <VanDungPayloadBuilder payload={payload} onChange={onChange} readOnly={readOnly} />

    default:
      // Fallback generic renderer for custom or unrecognized node payloads
      return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-[var(--radius-xl)] space-y-2 font-body text-xs">
          <span className="font-mono font-bold uppercase text-slate-500 block">
            NỘI DUNG NODE PAYLOAD ({nodeType || 'NÂNG CAO'}):
          </span>
          <pre className="p-3 bg-white border border-slate-200 rounded-[var(--radius-lg)] font-mono text-[11px] text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )
  }
}
