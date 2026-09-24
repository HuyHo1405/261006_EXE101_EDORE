'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function LegacyCreateCourseScriptPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  useEffect(() => {
    if (courseId) {
      router.replace(`/dashboard/scripts/new?courseId=${courseId}`)
    } else {
      router.replace('/dashboard/scripts/new')
    }
  }, [courseId, router])

  return (
    <div className="min-h-screen bg-[var(--color-primary-500)] flex items-center justify-center font-body">
      <div className="flex items-center gap-3 text-white text-sm font-bold bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/20">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>Đang chuyển hướng sang trang tạo kịch bản mới...</span>
      </div>
    </div>
  )
}
