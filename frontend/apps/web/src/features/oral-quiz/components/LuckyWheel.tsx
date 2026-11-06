'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { Play, Volume2, VolumeX } from 'lucide-react'

interface LuckyWheelProps {
  totalStudents: number
  excludedNumbers: number[]
  isSpinning: boolean
  onSpinStart: () => void
  onFinish: (stt: number) => void
  selectedNumber: number | null
}

// Edore brand color palette (Vibrant harmonious tones with high contrast)
const WHEEL_COLORS = [
  '#034ce4', // Edore Royal Blue
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#0284c7', // Sky Blue
  '#f97316', // Orange
]

export function LuckyWheel({
  totalStudents,
  excludedNumbers,
  isSpinning,
  onSpinStart,
  onFinish,
  selectedNumber,
}: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Current angle in radians
  const angleRef = useRef<number>(0)
  const isSpinningRef = useRef<boolean>(false)

  // Sound mute state & AudioContext singleton
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem('edore_wheel_muted') === 'true'
    } catch {
      return false
    }
  })
  const isMutedRef = useRef<boolean>(isMuted)
  isMutedRef.current = isMuted

  const audioCtxRef = useRef<AudioContext | null>(null)

  // Lazily get or create shared AudioContext and ensure it is resumed
  const getAudioContext = useCallback((): AudioContext | null => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return null

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx()
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {})
      }

      return audioCtxRef.current
    } catch {
      return null
    }
  }, [])

  // Web Audio sound generator (reusing single AudioContext safely)
  const playTickSound = useCallback(() => {
    if (isMutedRef.current) return
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }

      // Schedule slightly in the future (+2ms) to avoid browser timing clamp
      const t = ctx.currentTime + 0.002
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Crisp mechanical ratchet click: 950Hz dropping to 320Hz over 35ms
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(950, t)
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.035)

      // Solid, audible volume
      gain.gain.setValueAtTime(0.4, t)
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.035)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.038)
    } catch {
      // AudioContext muted/unsupported
    }
  }, [getAudioContext])

  const playWinSound = useCallback(() => {
    if (isMutedRef.current) return
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }

      const baseTime = ctx.currentTime + 0.005
      // Fanfare arpeggio: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteTime = baseTime + idx * 0.09

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, noteTime)

        gain.gain.setValueAtTime(0.35, noteTime)
        gain.gain.linearRampToValueAtTime(0.0001, noteTime + 0.32)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(noteTime)
        osc.stop(noteTime + 0.35)
      })
    } catch {
      // AudioContext muted/unsupported
    }
  }, [getAudioContext])

  // Calculate available numbers
  const availableNumbers = React.useMemo(() => {
    const list: number[] = []
    for (let i = 1; i <= totalStudents; i++) {
      if (!excludedNumbers.includes(i)) {
        list.push(i)
      }
    }
    return list.length > 0 ? list : Array.from({ length: totalStudents }, (_, i) => i + 1)
  }, [totalStudents, excludedNumbers])

  // Draw wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 18

    ctx.clearRect(0, 0, width, height)

    const count = availableNumbers.length
    if (count === 0) return

    const sliceAngle = (2 * Math.PI) / count
    const startOffset = angleRef.current

    // 1. Draw outer rim (Layered gameshow rim with subtle metallic bezel)
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 9, 0, 2 * Math.PI)
    ctx.fillStyle = '#0f172a'
    ctx.shadowColor = 'rgba(3, 76, 228, 0.3)'
    ctx.shadowBlur = 12
    ctx.fill()

    // Inner metallic bezel
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 7, 0, 2 * Math.PI)
    const rimGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
    rimGrad.addColorStop(0, '#1e293b')
    rimGrad.addColorStop(0.5, '#334155')
    rimGrad.addColorStop(1, '#0f172a')
    ctx.fillStyle = rimGrad
    ctx.fill()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#38bdf8'
    ctx.stroke()
    ctx.restore()

    // 2. Draw outer decorative lights (LED bulbs)
    const dotCount = Math.min(Math.max(count * 2, 24), 36)
    for (let d = 0; d < dotCount; d++) {
      const dotAngle = (d * (2 * Math.PI)) / dotCount
      const dotX = centerX + (radius + 4) * Math.cos(dotAngle)
      const dotY = centerY + (radius + 4) * Math.sin(dotAngle)
      ctx.save()
      ctx.beginPath()
      ctx.arc(dotX, dotY, 2.2, 0, 2 * Math.PI)
      if (d % 3 === 0) {
        ctx.fillStyle = '#fbbf24'
        ctx.shadowColor = '#f59e0b'
      } else if (d % 3 === 1) {
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = '#ffffff'
      } else {
        ctx.fillStyle = '#38bdf8'
        ctx.shadowColor = '#0ea5e9'
      }
      ctx.shadowBlur = 4
      ctx.fill()
      ctx.restore()
    }

    // 3. Draw Slices
    for (let i = 0; i < count; i++) {
      const sliceStart = startOffset + i * sliceAngle
      const sliceEnd = sliceStart + sliceAngle
      const num = availableNumbers[i]

      // Slice background
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, sliceStart, sliceEnd)
      ctx.closePath()

      const isCurrentSelected = num === selectedNumber
      ctx.fillStyle = isCurrentSelected ? '#ef4444' : WHEEL_COLORS[i % WHEEL_COLORS.length]
      ctx.fill()
      ctx.lineWidth = 1.2
      ctx.strokeStyle = '#ffffff'
      ctx.stroke()

      // Slice Text (STT number)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(sliceStart + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
      ctx.shadowBlur = 3

      const fontSize = count > 35 ? 12 : count > 22 ? 14 : 16
      ctx.font = `bold ${fontSize}px "IBM Plex Mono", monospace`
      ctx.fillText(String(num), radius - 15, 0)
      ctx.restore()
    }

    // 4. Center hub (Layered 3D Button)
    ctx.save()
    // Outer white ring with shadow
    ctx.beginPath()
    ctx.arc(centerX, centerY, 34, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 2
    ctx.fill()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#e2e8f0'
    ctx.stroke()

    // Inner vibrant blue gradient button
    ctx.beginPath()
    ctx.arc(centerX, centerY, 27, 0, 2 * Math.PI)
    const hubGrad = ctx.createLinearGradient(centerX, centerY - 27, centerX, centerY + 27)
    hubGrad.addColorStop(0, '#2563eb')
    hubGrad.addColorStop(1, '#034ce4')
    ctx.fillStyle = hubGrad
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.stroke()

    // Inner text "QUAY"
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px "IBM Plex Sans", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 2
    ctx.fillText('QUAY', centerX, centerY)
    ctx.restore()

    // 5. Draw indicator pointer at 12 o'clock (Sleek Gameshow Needle)
    ctx.save()
    ctx.translate(centerX, centerY - radius - 2)

    // Needle drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 3

    // Needle body
    ctx.beginPath()
    ctx.moveTo(-11, -12)
    ctx.lineTo(11, -12)
    ctx.lineTo(0, 16)
    ctx.closePath()

    const pointerGrad = ctx.createLinearGradient(0, -12, 0, 16)
    pointerGrad.addColorStop(0, '#fbbf24')
    pointerGrad.addColorStop(1, '#d97706')
    ctx.fillStyle = pointerGrad
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()

    // Center jewel / screw pin at pointer top
    ctx.beginPath()
    ctx.arc(0, -9, 3.5, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#b45309'
    ctx.stroke()
    ctx.restore()
  }, [availableNumbers, selectedNumber])

  // Redraw when dependencies change
  useEffect(() => {
    drawWheel()
  }, [drawWheel])

  // Spin animation trigger
  const spinToWinner = useCallback((targetNumber: number) => {
    if (isSpinningRef.current) return
    isSpinningRef.current = true

    const count = availableNumbers.length
    const targetIdx = availableNumbers.indexOf(targetNumber)
    if (targetIdx === -1) {
      isSpinningRef.current = false
      return
    }

    const sliceAngle = (2 * Math.PI) / count
    const fullSpins = 6 + Math.floor(Math.random() * 3)
    const targetBaseAngle = -Math.PI / 2 - (targetIdx + 0.5) * sliceAngle
    const totalRotation = fullSpins * 2 * Math.PI + (targetBaseAngle - (angleRef.current % (2 * Math.PI)))

    const startAngle = angleRef.current
    const duration = 5000
    const startTime = performance.now()
    let lastTickSlice = -1
    let lastTickTime = 0

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3.5)
      const current = startAngle + totalRotation * ease
      angleRef.current = current

      // Check for slice passage to play tick sound (throttled to >= 25ms to prevent audio jitter)
      const slicesRotated = Math.floor(Math.abs(current - startAngle) / sliceAngle)
      if (slicesRotated !== lastTickSlice && progress < 0.98) {
        lastTickSlice = slicesRotated
        const timeSinceLastTick = now - lastTickTime
        if (timeSinceLastTick >= 25) {
          lastTickTime = now
          playTickSound()
        }
      }

      drawWheel()

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        isSpinningRef.current = false
        playWinSound()
        onFinish(targetNumber)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }, [availableNumbers, drawWheel, onFinish, playTickSound, playWinSound])

  // Trigger spin when `isSpinning` becomes true
  useEffect(() => {
    if (isSpinning && !isSpinningRef.current) {
      const ctx = getAudioContext()
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      const randomWinner = availableNumbers[Math.floor(Math.random() * availableNumbers.length)]
      spinToWinner(randomWinner)
    }
  }, [isSpinning, availableNumbers, spinToWinner, getAudioContext])

  // Cleanup on unmount (cancel animation & close AudioContext to release hardware)
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
    }
  }, [])

  // User click trigger (actively unlocks Web Audio on user gesture)
  const handleUserTrigger = () => {
    if (isSpinning || availableNumbers.length === 0) return
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    // Prime audio during user gesture
    playTickSound()
    onSpinStart()
  }

  // Toggle sound mute/unmute
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev
      try {
        localStorage.setItem('edore_wheel_muted', String(next))
      } catch {
        // Ignore storage errors
      }
      return next
    })
    getAudioContext()
  }

  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-2">
      {/* Canvas Wheel container with subtle radial glow */}
      <div className="relative group cursor-pointer" onClick={handleUserTrigger}>
        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-amber-500/15 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="relative max-w-[240px] sm:max-w-[270px] md:max-w-[300px] aspect-square rounded-[var(--radius-full)] shadow-lg transition-transform duration-200 group-hover:scale-[1.01]"
        />
      </div>

      {/* Control buttons & Sound toggle */}
      <div className="mt-3 flex items-center gap-2.5">
        <button
          onClick={handleUserTrigger}
          disabled={isSpinning || availableNumbers.length === 0}
          className={`group flex items-center gap-2.5 px-6 sm:px-7 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer ${
            isSpinning
              ? 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)] cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[var(--color-primary-500)] to-indigo-600 hover:from-[#023ec0] hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
          }`}
        >
          <Play className={`w-4 h-4 fill-current transition-transform ${isSpinning ? 'animate-spin' : 'group-hover:scale-110'}`} />
          <span>{isSpinning ? 'Đang quay số...' : 'QUAY CHỌN HỌC SINH'}</span>
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
          title={isMuted ? 'Bật âm thanh vòng quay' : 'Tắt âm thanh vòng quay'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          )}
        </button>
      </div>

      {/* Available students badge */}
      <div className="mt-1.5 text-xs text-[var(--color-neutral-500)] dark:text-slate-400 font-medium flex items-center gap-1.5 font-mono">
        <span>Còn lại:</span>
        <strong className="text-[var(--color-primary-500)] dark:text-blue-400 font-bold">{availableNumbers.length}</strong>
        <span>/ {totalStudents} học sinh</span>
        {excludedNumbers.length > 0 && (
          <span className="text-[var(--color-neutral-400)] dark:text-slate-500">({excludedNumbers.length} đã gọi)</span>
        )}
      </div>
    </div>
  )
}
