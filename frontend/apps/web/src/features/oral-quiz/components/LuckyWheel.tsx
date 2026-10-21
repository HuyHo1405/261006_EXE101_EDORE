'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { Play } from 'lucide-react'

interface LuckyWheelProps {
  totalStudents: number
  excludedNumbers: number[]
  isSpinning: boolean
  onSpinStart: () => void
  onFinish: (stt: number) => void
  selectedNumber: number | null
}

// Edore brand color palette (Primary, Tertiary Teal, Secondary Amber, and shades)
const WHEEL_COLORS = [
  '#034ce4', // Primary 500
  '#12ab83', // Tertiary 500 (Teal)
  '#f28c0f', // Secondary 500 (Amber)
  '#023ec0', // Primary 600
  '#0e906e', // Tertiary 600
  '#d47304', // Secondary 600
  '#2a69ea', // Primary 400
  '#35bea0', // Tertiary 400
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

  // Web Audio sound generator (synthesized tick & victory chime)
  const playTickSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(560, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch {
      // AudioContext muted/unsupported
    }
  }, [])

  const playWinSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1)
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + idx * 0.1)
        osc.stop(ctx.currentTime + idx * 0.1 + 0.4)
      })
    } catch {
      // AudioContext muted/unsupported
    }
  }, [])

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

    // 1. Draw outer rim (Neutral 800 with Primary border)
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI)
    ctx.fillStyle = '#1a1c1f'
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#034ce4'
    ctx.stroke()
    ctx.restore()

    // 2. Draw outer decorative dots
    const dotCount = Math.min(count * 2, 36)
    for (let d = 0; d < dotCount; d++) {
      const dotAngle = (d * (2 * Math.PI)) / dotCount
      const dotX = centerX + (radius + 4) * Math.cos(dotAngle)
      const dotY = centerY + (radius + 4) * Math.sin(dotAngle)
      ctx.beginPath()
      ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI)
      ctx.fillStyle = d % 2 === 0 ? '#f28c0f' : '#ffffff'
      ctx.fill()
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

      const fontSize = count > 35 ? 12 : count > 22 ? 14 : 16
      ctx.font = `bold ${fontSize}px "IBM Plex Mono", monospace`
      ctx.fillText(String(num), radius - 16, 0)
      ctx.restore()
    }

    // 4. Center hub (Edore Primary button)
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, 36, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#034ce4'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI)
    ctx.fillStyle = '#034ce4'
    ctx.fill()

    // Inner text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px "Saira Extra Condensed", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('QUAY', centerX, centerY)
    ctx.restore()

    // 5. Draw indicator pointer at 12 o'clock (Secondary Amber)
    ctx.save()
    ctx.translate(centerX, centerY - radius - 5)
    ctx.beginPath()
    ctx.moveTo(-12, -12)
    ctx.lineTo(12, -12)
    ctx.lineTo(0, 14)
    ctx.closePath()
    ctx.fillStyle = '#f28c0f'
    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 6
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#ffffff'
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

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3.5)
      const current = startAngle + totalRotation * ease
      angleRef.current = current

      // Check for slice passage to play tick sound
      const normalizedAngle = (-angleRef.current + 2 * Math.PI) % (2 * Math.PI)
      const currentSlice = Math.floor(normalizedAngle / sliceAngle)
      if (currentSlice !== lastTickSlice && progress < 0.96) {
        lastTickSlice = currentSlice
        playTickSound()
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
      const randomWinner = availableNumbers[Math.floor(Math.random() * availableNumbers.length)]
      spinToWinner(randomWinner)
    }
  }, [isSpinning, availableNumbers, spinToWinner])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-2">
      {/* Canvas Wheel container */}
      <div className="relative cursor-pointer" onClick={() => !isSpinning && onSpinStart()}>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-[240px] sm:max-w-[270px] md:max-w-[300px] aspect-square rounded-[var(--radius-full)] shadow-md transition-transform duration-200 hover:scale-[1.01]"
        />
      </div>

      {/* Control button */}
      <div className="mt-2.5 sm:mt-3 flex items-center gap-3">
        <button
          onClick={onSpinStart}
          disabled={isSpinning || availableNumbers.length === 0}
          className={`flex items-center gap-2 px-6 py-2 rounded-[var(--radius-md)] font-bold text-sm shadow-xs transition-all cursor-pointer ${
            isSpinning
              ? 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-500)] cursor-not-allowed'
              : 'bg-[var(--color-primary-500)] hover:bg-[#023ec0] text-white active:scale-[0.98]'
          }`}
        >
          <Play className={`w-4 h-4 fill-current ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'Đang quay số...' : 'QUAY CHỌN HỌC SINH'}
        </button>
      </div>

      {/* Available students badge */}
      <div className="mt-1.5 text-xs text-[var(--color-neutral-500)] font-medium flex items-center gap-1.5 font-mono">
        <span>Còn lại:</span>
        <strong className="text-[var(--color-primary-500)] font-bold">{availableNumbers.length}</strong>
        <span>/ {totalStudents} học sinh</span>
        {excludedNumbers.length > 0 && (
          <span className="text-[var(--color-neutral-400)]">({excludedNumbers.length} đã gọi)</span>
        )}
      </div>
    </div>
  )
}
