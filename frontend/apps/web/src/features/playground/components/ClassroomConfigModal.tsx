'use client'

import { useState } from 'react'
import { Settings, X, Check } from 'lucide-react'
import {
  ClassConfigEditor,
  type ClassConfigData,
} from '@/features/course/components/ClassConfigEditor'

export interface ClassroomCtx {
  duration?: number | string
  studentCount?: string
  template_id?: string
  learning_outcome?: string
  learningSpace?: string
  seatingArrangement?: string
  classroomInfra?: string[]
  studentDevice?: string[]
  classConfigId?: string
  configName?: string
  rawClassConfig?: ClassConfigData
  [key: string]: unknown
}

interface ClassroomConfigModalProps {
  ctx: ClassroomCtx
  onChange: (ctx: ClassroomCtx) => void
  onClose: () => void
}

function ctxToClassConfigData(ctx: ClassroomCtx): ClassConfigData {
  if (ctx.rawClassConfig) {
    return ctx.rawClassConfig
  }

  let durStr = 'MIN_45'
  const durVal = String(ctx.duration || '')
  if (durVal === '45' || durVal === 'MIN_45') durStr = 'MIN_45'
  else if (durVal === '60' || durVal === 'MIN_60') durStr = 'MIN_60'
  else if (durVal === '90' || durVal === 'MIN_90') durStr = 'MIN_90'
  else if (durVal === '120' || durVal === 'MIN_120') durStr = 'MIN_120'
  else if (durVal === '135' || durVal === 'MIN_135') durStr = 'MIN_135'
  else if (durVal === '180' || durVal === 'MIN_180') durStr = 'MIN_180'

  let sizeStr = 'MEDIUM'
  if (ctx.studentCount === '<=10' || ctx.studentCount === 'SMALL') sizeStr = 'SMALL'
  else if (ctx.studentCount === '11-30' || ctx.studentCount === 'MEDIUM') sizeStr = 'MEDIUM'
  else if (ctx.studentCount === '>30' || ctx.studentCount === 'LARGE') sizeStr = 'LARGE'
  else if (ctx.studentCount === 'VERY_LARGE') sizeStr = 'VERY_LARGE'

  let spaceStr = 'STANDARD'
  if (ctx.learningSpace === 'lab' || ctx.learningSpace === 'COMPUTER_LAB') spaceStr = 'COMPUTER_LAB'
  else if (ctx.learningSpace === 'outdoor' || ctx.learningSpace === 'OUTDOOR') spaceStr = 'OUTDOOR'
  else if (ctx.learningSpace === 'online' || ctx.learningSpace === 'ONLINE') spaceStr = 'ONLINE'
  else if (ctx.learningSpace === 'AUDITORIUM') spaceStr = 'AUDITORIUM'

  let seatingStr = 'ROWS'
  if (ctx.seatingArrangement === 'u-shape' || ctx.seatingArrangement === 'U_SHAPE') seatingStr = 'U_SHAPE'
  else if (ctx.seatingArrangement === 'groups' || ctx.seatingArrangement === 'GROUPS') seatingStr = 'GROUPS'
  else if (ctx.seatingArrangement === 'flexible' || ctx.seatingArrangement === 'CIRCLE') seatingStr = 'CIRCLE'

  return {
    id: (ctx.classConfigId as string) || '',
    name: (ctx.configName as string) || '',
    duration: durStr,
    classSize: sizeStr,
    space: spaceStr,
    seatingLayout: seatingStr,
  }
}

function classConfigDataToCtx(data: ClassConfigData, prevCtx: ClassroomCtx): ClassroomCtx {
  const durationMap: Record<string, number> = {
    MIN_45: 45,
    MIN_60: 60,
    MIN_90: 90,
    MIN_120: 120,
    MIN_135: 135,
    MIN_180: 180,
  }
  const durationNum = durationMap[data.duration || ''] || 45

  const sizeMap: Record<string, string> = {
    SMALL: '<=10',
    MEDIUM: '11-30',
    LARGE: '>30',
    VERY_LARGE: '>60',
  }

  const spaceMap: Record<string, string> = {
    STANDARD: 'classroom',
    COMPUTER_LAB: 'lab',
    AUDITORIUM: 'auditorium',
    OUTDOOR: 'outdoor',
    ONLINE: 'online',
  }

  const seatingMap: Record<string, string> = {
    ROWS: 'rows',
    U_SHAPE: 'u-shape',
    GROUPS: 'groups',
    CIRCLE: 'flexible',
    INDIVIDUAL_DESKS: 'rows',
  }

  return {
    ...prevCtx,
    classConfigId: data.id || undefined,
    configName: data.name || undefined,
    duration: durationNum,
    studentCount: sizeMap[data.classSize || ''] || '11-30',
    learningSpace: spaceMap[data.space || ''] || 'classroom',
    seatingArrangement: seatingMap[data.seatingLayout || ''] || 'rows',
    rawClassConfig: data,
  }
}

export default function ClassroomConfigModal({ ctx, onChange, onClose }: ClassroomConfigModalProps) {
  const [configData, setConfigData] = useState<ClassConfigData>(() => ctxToClassConfigData(ctx))

  const handleConfigChange = (newData: ClassConfigData) => {
    setConfigData(newData)
    const updatedCtx = classConfigDataToCtx(newData, ctx)
    onChange(updatedCtx)
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto cursor-pointer font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-3xl border border-[var(--color-neutral-200)] shadow-2xl flex flex-col animate-scale-up my-8 sm:my-auto overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-header text-base font-extrabold uppercase tracking-tight text-slate-900">
                Cấu hình phòng học
              </h2>
              <p className="font-body text-xs text-slate-500">
                Chọn mẫu có sẵn hoặc tùy chỉnh ngữ cảnh lớp học cho AI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <ClassConfigEditor
            value={configData}
            onChange={handleConfigChange}
            showHeadings={false}
          />
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex justify-end items-center">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Áp dụng cấu hình</span>
          </button>
        </div>
      </div>
    </div>
  )
}
