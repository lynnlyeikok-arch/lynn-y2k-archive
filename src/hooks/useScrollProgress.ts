import { useEffect, useState } from 'react'
import { clamp } from '../utils/timelineProgress'

export const SCROLL_SMOOTHING = 0.1

export function useScrollProgress(target: HTMLElement | null, enabled: boolean) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!target || !enabled) {
      setProgress(0)
      return
    }

    let frame = 0
    let current = 0
    let running = true
    let settled = false

    const readTarget = () => {
      const total = target.offsetHeight - window.innerHeight
      const scrolled = window.scrollY || document.documentElement.scrollTop
      return total <= 0 ? 0 : clamp(scrolled / total)
    }

    const tick = () => {
      if (!running) return
      const next = readTarget()
      current += (next - current) * SCROLL_SMOOTHING
      if (Math.abs(next - current) < 0.00012) {
        current = next
        if (!settled) {
          settled = true
          setProgress(current)
        }
      } else {
        settled = false
        setProgress(current)
      }
      frame = requestAnimationFrame(tick)
    }

    current = readTarget()
    setProgress(current)
    frame = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(frame)
    }
  }, [target, enabled])

  return progress
}
