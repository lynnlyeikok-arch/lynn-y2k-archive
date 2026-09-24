import { useEffect, useRef } from 'react'
import { clamp, getTunnelMood, TUNNEL_SPEED } from '../utils/timelineProgress'
import {
  DESKTOP_FIELD,
  MOBILE_FIELD,
  rayToRect,
  type LaneSegment,
} from '../utils/tunnelStreaks'

type TimeTunnelProps = {
  progress: number
  entry: number
  reducedMotion: boolean
}

export const OVERSCAN = 1.22
const U_MIN = 0.028
const U_SPAN = 1.12

function wrapU(value: number) {
  let t = (value - U_MIN) % U_SPAN
  if (t < 0) t += U_SPAN
  return U_MIN + t
}

function hexRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha)})`
}

function drawBar(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  color: string,
  alpha: number,
) {
  const len = Math.hypot(x1 - x0, y1 - y0)
  if (len < 1.2) return

  ctx.strokeStyle = rgba(color, alpha)
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()

  if (width < 3.2) return
  const angle = Math.atan2(y1 - y0, x1 - x0)
  const nx = -Math.sin(angle)
  const ny = Math.cos(angle)
  const lift = width * 0.18
  ctx.strokeStyle = rgba('#FFF1F8', alpha * 0.32)
  ctx.lineWidth = Math.max(1, width * 0.22)
  ctx.beginPath()
  ctx.moveTo(x0 + nx * lift, y0 + ny * lift)
  ctx.lineTo(x1 + nx * lift, y1 + ny * lift)
  ctx.stroke()
}

function paint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  entry: number,
  reducedMotion: boolean,
  segments: LaneSegment[],
) {
  ctx.clearRect(0, 0, width, height)
  const mood = getTunnelMood(progress)
  const cx = width * 0.5
  const cy = height * 0.5
  const viewW = width / OVERSCAN
  const viewH = height / OVERSCAN
  const halfW = viewW * 0.5
  const halfH = viewH * 0.5
  const travel = reducedMotion ? 0.18 : entry * 0.08 + progress * TUNNEL_SPEED

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(halfW, halfH) * 0.42)
  glow.addColorStop(0, `rgba(122, 22, 70, ${0.28 + mood.brightness * 0.08})`)
  glow.addColorStop(0.55, 'rgba(62, 10, 37, 0.1)')
  glow.addColorStop(1, 'rgba(22, 3, 12, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  const ordered = segments
    .map((segment) => {
      const u = reducedMotion ? wrapU(segment.u0) : wrapU(segment.u0 + travel * segment.speed)
      return { segment, u }
    })
    .sort((a, b) => a.u - b.u)

  const safe = Math.min(halfW, halfH) * 0.16

  for (const { segment, u } of ordered) {
    const dx = Math.cos(segment.angle)
    const dy = Math.sin(segment.angle)
    const edge = rayToRect(dx, dy, halfW, halfH)
    const maxR = edge * segment.overshoot
    const grown = segment.length * (0.92 + u * 0.22)
    const u1 = u + grown
    const r0 = u * maxR
    const r1 = Math.min(u1, 1.22) * maxR
    if (r1 - r0 < 2) continue

    const x0 = cx + dx * r0
    const y0 = cy + dy * r0
    const x1 = cx + dx * r1
    const y1 = cy + dy * r1
    const rMid = (r0 + r1) * 0.5
    const maxWidth = Math.max(0.9, segment.laneGap * rMid * 0.52)
    const widthPx = Math.min(segment.width * (0.42 + u * 0.7), maxWidth)
    if (widthPx < 0.7) continue

    const centerFade =
      segment.kind === 'thick'
        ? clamp((rMid - safe * 0.85) / (safe * 0.9))
        : 0.28 + 0.72 * clamp((rMid - safe * 0.2) / (safe * 1.5))
    const depthFade = 0.42 + 0.58 * clamp(u)
    const alpha = 0.92 * mood.streakOpacity * centerFade * depthFade
    if (alpha < 0.03) continue

    drawBar(ctx, x0, y0, x1, y1, widthPx, segment.color, alpha)
  }
}

export function TimeTunnel({ progress, entry, reducedMotion }: TimeTunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)
  const entryRef = useRef(entry)
  const reducedRef = useRef(reducedMotion)
  const mobileRef = useRef(false)

  progressRef.current = progress
  entryRef.current = entry
  reducedRef.current = reducedMotion

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let frame = 0
    let running = true
    let visible = true
    let resizeTimer = 0

    const currentSegments = () => (mobileRef.current ? MOBILE_FIELD.segments : DESKTOP_FIELD.segments)

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      mobileRef.current = parent.clientWidth < 800
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = parent.clientWidth * OVERSCAN
      const height = parent.clientHeight * OVERSCAN
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 100)
    }

    const tick = () => {
      if (!running) return
      if (!document.hidden && visible) {
        paint(
          ctx,
          canvas.clientWidth,
          canvas.clientHeight,
          progressRef.current,
          entryRef.current,
          reducedRef.current,
          currentSegments(),
        )
      }
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(([item]) => {
      visible = Boolean(item?.isIntersecting)
    })
    observer.observe(canvas)

    resize()
    paint(ctx, canvas.clientWidth, canvas.clientHeight, progress, entry, reducedMotion, currentSegments())
    frame = requestAnimationFrame(tick)
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="timeline-tunnel" aria-hidden="true" />
}
