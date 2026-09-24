'use client'

import React from 'react'
import { Rocket, FileCheck, Table, HelpCircle, CheckSquare, ShieldAlert } from 'lucide-react'
import type { VanDungPayload, RubricItem } from '../../types/nodePayload'

interface VanDungPayloadBuilderProps {
  payload: VanDungPayload
  onChange?: (updated: VanDungPayload) => void
  readOnly?: boolean
}

export function VanDungPayloadBuilder({
  payload = {},
  onChange,
  readOnly = false,
}: VanDungPayloadBuilderProps) {
  const scenario = payload.scenario || ''
  const taskRequirement = payload.task_requirement || ''
  const expectedOutputForm = payload.expected_output_form || ''
  const rubric: RubricItem[] = payload.rubric || []
  const scaffoldingHint = payload.scaffolding_hint || ''

  const handleFieldChange = (field: keyof VanDungPayload, value: any) => {
    if (!onChange) return
    onChange({
      ...payload,
      [field]: value,
    })
  }

  const handleRubricChange = (idx: number, field: keyof RubricItem, value: string) => {
    if (!onChange) return
    const updatedRubric = [...rubric]
    updatedRubric[idx] = {
      ...updatedRubric[idx],
      [field]: value,
    }
    onChange({
      ...payload,
      rubric: updatedRubric,
    })
  }

  return (
    <div className="space-y-4 font-body">
      {/* Header Banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-[var(--radius-lg)] text-purple-900 shadow-xs">
        <Rocket className="w-4 h-4 text-purple-600 shrink-0" />
        <span className="font-header text-xs font-extrabold uppercase tracking-wider">
          HOẠT ĐỘNG VẬN DỤNG & DỰ ÁN THỰC TẾ
        </span>
      </div>

      {/* 1. Scenario Card */}
      {scenario && (
        <div className="bg-white border-2 border-purple-200 rounded-[var(--radius-xl)] p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-2">
            <FileCheck className="w-4 h-4 text-purple-600" />
            <h4 className="font-header text-xs font-extrabold uppercase text-slate-900">
              1. Tình huống thực tế (Scenario)
            </h4>
          </div>
          {readOnly ? (
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-purple-50/50 p-3 rounded-[var(--radius-lg)] border border-purple-100">
              "{scenario}"
            </p>
          ) : (
            <textarea
              value={scenario}
              onChange={(e) => handleFieldChange('scenario', e.target.value)}
              placeholder="Nhập tình huống thực tế hoặc bối cảnh dự án..."
              className="w-full h-20 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-[var(--radius-lg)] p-3 outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white resize-none leading-relaxed"
            />
          )}
        </div>
      )}

      {/* 2. Task Requirement & Output Form */}
      {(taskRequirement || expectedOutputForm) && (
        <div className="bg-white border-2 border-slate-200 rounded-[var(--radius-xl)] p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <CheckSquare className="w-4 h-4 text-purple-600" />
            <h4 className="font-header text-xs font-extrabold uppercase text-slate-900">
              2. Yêu cầu nhiệm vụ & Sản phẩm bàn giao
            </h4>
          </div>

          <div className="space-y-2">
            {taskRequirement && (
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-500">Yêu cầu nhiệm vụ:</span>
                {readOnly ? (
                  <p className="text-xs text-slate-800 leading-relaxed font-semibold bg-slate-50 p-2.5 rounded-[var(--radius-md)] border border-slate-200">
                    {taskRequirement}
                  </p>
                ) : (
                  <textarea
                    value={taskRequirement}
                    onChange={(e) => handleFieldChange('task_requirement', e.target.value)}
                    className="w-full h-16 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-[var(--radius-md)] p-2 outline-none"
                  />
                )}
              </div>
            )}

            {expectedOutputForm && (
              <div className="flex items-center gap-2 text-xs bg-purple-50/70 p-2.5 rounded-[var(--radius-md)] border border-purple-200">
                <span className="font-mono text-[10px] font-bold text-purple-800 uppercase shrink-0">Hình thức sản phẩm:</span>
                {readOnly ? (
                  <span className="font-bold text-purple-950">{expectedOutputForm}</span>
                ) : (
                  <input
                    type="text"
                    value={expectedOutputForm}
                    onChange={(e) => handleFieldChange('expected_output_form', e.target.value)}
                    className="flex-1 bg-white border border-purple-200 rounded px-2 py-1 outline-none font-bold text-purple-950 text-xs"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Rubric Table */}
      {rubric.length > 0 && (
        <div className="bg-white border-2 border-slate-200 rounded-[var(--radius-xl)] p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Table className="w-4 h-4 text-purple-600" />
            <h4 className="font-header text-xs font-extrabold uppercase text-slate-900">
              3. Tiêu chí đánh giá (Rubric - {rubric.length} tiêu chí)
            </h4>
          </div>

          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-900 font-header font-bold text-[11px] uppercase border-b border-purple-200">
                  <th className="p-2.5 w-1/3">Tiêu chí</th>
                  <th className="p-2.5">Mô tả đạt chuẩn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rubric.map((item, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 align-top">
                      {readOnly ? (
                        item.criterion
                      ) : (
                        <input
                          type="text"
                          value={item.criterion || ''}
                          onChange={(e) => handleRubricChange(idx, 'criterion', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1 outline-none text-xs font-bold"
                        />
                      )}
                    </td>
                    <td className="p-2.5 text-slate-700 leading-relaxed align-top">
                      {readOnly ? (
                        item.description
                      ) : (
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => handleRubricChange(idx, 'description', e.target.value)}
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded p-1 outline-none text-xs"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Scaffolding Hint */}
      {scaffoldingHint && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-[var(--radius-xl)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
              GỢI Ý HỖ TRỢ GIÀN GIÁO (SCAFFOLDING HINT)
            </span>
          </div>
          {readOnly ? (
            <p className="text-xs text-amber-950 italic leading-relaxed">
              💡 {scaffoldingHint}
            </p>
          ) : (
            <textarea
              value={scaffoldingHint}
              onChange={(e) => handleFieldChange('scaffolding_hint', e.target.value)}
              className="w-full h-16 text-xs bg-white border border-amber-200 rounded p-2 outline-none text-amber-950 italic"
            />
          )}
        </div>
      )}
    </div>
  )
}
