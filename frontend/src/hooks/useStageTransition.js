import { useState, useRef, useCallback } from 'react'

/**
 * useStageTransition
 *
 * Manages a fade-out → (delay) → swap → fade-in cycle between stages.
 *
 * Returns:
 *   visibleStage   — the stage that is currently rendered (lags behind `stage` during exit)
 *   isExiting      — true during the exit animation; consumer applies `.stage-exit`
 *   goTo(newStage) — trigger a transition to a new stage
 *
 * Timing:
 *   EXIT_MS  (160ms) — matches .stage-exit animation duration in index.css
 *   ENTER_MS (60ms)  — brief pause before the new panel mounts (feels more deliberate)
 */

const EXIT_MS  = 160
const ENTER_MS = 60

export function useStageTransition(initialStage = 'filters') {
  const [visibleStage, setVisibleStage] = useState(initialStage)
  const [isExiting, setIsExiting]       = useState(false)
  const timerRef = useRef(null)

  const goTo = useCallback((newStage) => {
    // Clear any in-flight transition
    if (timerRef.current) clearTimeout(timerRef.current)

    // 1. Start exit animation
    setIsExiting(true)

    // 2. After exit animation completes, swap the stage
    timerRef.current = setTimeout(() => {
      setVisibleStage(newStage)
      setIsExiting(false)
    }, EXIT_MS + ENTER_MS)
  }, [])

  return { visibleStage, isExiting, goTo }
}
