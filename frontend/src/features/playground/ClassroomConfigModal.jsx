import { useState } from 'react'

// Style cho Chip thanh thoát hơn (Pill shape)
const CHIP_CLASS_ACTIVE = 'border-[#0058be] bg-[#eaedff] text-[#0058be] font-bold ring-1 ring-[#0058be]'
const CHIP_CLASS_IDLE = 'border-[#e2e8f0] bg-white hover:bg-slate-50 text-[#424754] font-medium'

function ChipGroup({ label, icon, field, options, value, onUpdate, isMulti = false }) {
  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#727785]">
        <span className="material-symbols-outlined text-[16px] text-[#0058be]">{icon}</span>
        {label}
        {isMulti && <span className="text-[10px] font-normal normal-case text-[#94a3b8] ml-1">(chọn nhiều)</span>}
      </label>

      <div className="flex flex-wrap gap-2.5">
        {options.map(opt => {
          const isSelected = isMulti
            ? (value || []).includes(opt.value)
            : value === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => {
                if (isMulti) {
                  const prev = value || []
                  const next = isSelected ? prev.filter(v => v !== opt.value) : [...prev, opt.value]
                  onUpdate(field, next)
                } else {
                  onUpdate(field, opt.value)
                }
              }}
              // Dùng pr-8 cho multi-select để chừa chỗ cho icon check, khóa cứng width
              className={`relative py-1.5 ${isMulti ? 'pl-4 pr-8' : 'px-4'} rounded-full border text-[12px] transition-all flex items-center shadow-sm
                ${isSelected ? CHIP_CLASS_ACTIVE : CHIP_CLASS_IDLE}`}
            >
              {opt.label}

              {/* Absolute icon để không làm giật layout khi xuất hiện */}
              {isMulti && (
                <span
                  className={`material-symbols-outlined absolute right-2 text-[14px] transition-all duration-200 origin-center
                    ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                >
                  check
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ClassroomConfigModal({ ctx, onChange, onClose }) {
  const [local, setLocal] = useState(ctx || {})

  // Cập nhật state nội bộ và đồng thời gọi onChange ngay lập tức (Auto-save)
  const update = (field, val) => {
    setLocal(prev => {
      const nextState = { ...prev, [field]: val }
      onChange(nextState)
      return nextState
    })
  }

  return (
    <div
      // Bắt sự kiện click ra vùng đen (backdrop) để đóng form
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto cursor-pointer"
    >

      {/* Thêm overflow-hidden và chặn click xuyên qua form */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg h-fit border border-[#e2e8f0] shadow-2xl flex flex-col animate-scale-up my-8 sm:my-auto overflow-hidden cursor-default pb-5"
      >

        {/* Header - Đã loại bỏ nút X */}
        <div className="flex items-center gap-2 p-5 border-b border-[#e2e8f0]">
          <span className="material-symbols-outlined text-[#0058be]">tune</span>
          <div>
            <h2 className="font-extrabold text-base text-[#151b2d]">Cấu hình lớp học</h2>
            <p className="text-[10px] text-[#727785]">Ngữ cảnh giúp AI thiết kế phù hợp thực tế</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 bg-slate-50/30">

          {/* Dòng 1: Thời lượng + Quy mô */}
          <div className="grid grid-cols-2 gap-4">

            {/* Thời lượng */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#727785]">
                <span className="material-symbols-outlined text-sm text-[#0058be]">schedule</span>
                Thời lượng
              </label>
              <div className="relative">
                <select
                  value={local.duration || ''}
                  onChange={(e) => update('duration', e.target.value)}
                  className="w-full p-2.5 pl-3 pr-8 appearance-none rounded-lg border border-[#e2e8f0] hover:border-[#c2c6d6] text-xs font-semibold text-[#151b2d] outline-none focus:border-[#0058be] transition-colors bg-white cursor-pointer shadow-sm"
                >
                  <option value="" disabled>Chọn thời lượng...</option>
                  <option value="45">45 phút</option>
                  <option value="60">60 phút</option>
                  <option value="90">90 phút</option>
                  <option value="120">120 phút</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727785] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Quy mô lớp */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#727785]">
                <span className="material-symbols-outlined text-sm text-[#0058be]">group</span>
                Quy mô lớp
              </label>
              <div className="relative">
                <select
                  value={local.studentCount || ''}
                  onChange={(e) => update('studentCount', e.target.value)}
                  className="w-full p-2.5 pl-3 pr-8 appearance-none rounded-lg border border-[#e2e8f0] hover:border-[#c2c6d6] text-xs font-semibold text-[#151b2d] outline-none focus:border-[#0058be] transition-colors bg-white cursor-pointer shadow-sm"
                >
                  <option value="" disabled>Chọn số lượng...</option>
                  <option value="<=10">≤10 Học viên</option>
                  <option value="11-30">11–30 Học viên</option>
                  <option value=">30">31+ Học viên</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727785] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#e2e8f0] my-2" />

          {/* Dòng 2: Không gian học */}
          <ChipGroup
            label="Không gian học"
            icon="home_work"
            field="learningSpace"
            value={local.learningSpace}
            onUpdate={update}
            options={[
              { value: 'classroom', label: 'Lớp học' },
              { value: 'lab', label: 'Lab' },
              { value: 'outdoor', label: 'Ngoài trời' },
              { value: 'online', label: 'Online' },
            ]}
          />

          {/* Dòng 3: Bố trí chỗ ngồi */}
          <ChipGroup
            label="Bố trí chỗ ngồi"
            icon="table_restaurant"
            field="seatingArrangement"
            value={local.seatingArrangement}
            onUpdate={update}
            options={[
              { value: 'rows', label: 'Hàng dọc' },
              { value: 'groups', label: 'Nhóm bàn' },
              { value: 'u-shape', label: 'Chữ U' },
              { value: 'flexible', label: 'Linh hoạt' },
            ]}
          />

          {/* Dòng 4: Hạ tầng lớp học (Multi-select) */}
          <ChipGroup
            label="Hạ tầng lớp học"
            icon="display_settings"
            field="classroomInfra"
            value={local.classroomInfra}
            onUpdate={update}
            isMulti={true}
            options={[
              { value: 'wifi', label: 'WiFi mạnh' },
              { value: 'power', label: 'Ổ điện' },
              { value: 'display', label: 'Máy chiếu / TV' },
              { value: 'board', label: 'Bảng' },
            ]}
          />

          {/* Dòng 5: Thiết bị học viên (Multi-select) */}
          <ChipGroup
            label="Thiết bị học viên"
            icon="devices"
            field="studentDevice"
            value={local.studentDevice}
            onUpdate={update}
            isMulti={true}
            options={[
              { value: 'toolkit', label: 'Toolkit' },
              { value: 'phone', label: 'Điện thoại' },
              { value: 'laptop', label: 'Laptop' },
              { value: 'other', label: 'Khác' },
            ]}
          />

        </div>
      </div>
    </div>
  )
}