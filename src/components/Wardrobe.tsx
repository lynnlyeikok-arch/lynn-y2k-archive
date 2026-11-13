import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { clamp } from '../utils/timelineProgress'
import { loadOutfit, saveOutfit } from '../utils/outfitState'

type WardrobeProps = {
  enabled: boolean
  reveal: number
  exiting?: boolean
  onFinished?: () => void
}

type Slot = {
  cx: number
  y: number
  w: number
  h: number
  brightness: number
  z: number
}

type Garment = {
  src: string
  label: string
  visualScale: number
  offsetX: number
  offsetY: number
  ratio: number
  phoneScale?: number
}

const CANVAS_WIDTH = 1366
const CANVAS_HEIGHT = 765
const SY = CANVAS_HEIGHT / 768
const ITEM_COUNT = 10
const ANIM_MS = 580
const SWIPE_PX = 48

const TOPS: Garment[] = [
  { src: '/images/tops/top-01.png', label: 'Top 01', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 267 / 246 },
  { src: '/images/tops/top-02.png', label: 'Top 02', visualScale: 1, offsetX: 0, offsetY: 4, ratio: 271 / 217 },
  { src: '/images/tops/top-03.png', label: 'Top 03', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 283 / 298 },
  { src: '/images/tops/top-04.png', label: 'Top 04', visualScale: 1, offsetX: 0, offsetY: 2, ratio: 1 },
  { src: '/images/tops/top-05.png', label: 'Top 05', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 260 / 195 },
  { src: '/images/tops/top-06.png', label: 'Top 06', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 1 },
  { src: '/images/tops/top-07.png', label: 'Top 07', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 1 },
  { src: '/images/tops/top-08.png', label: 'Top 08', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 360 / 331 },
  { src: '/images/tops/top-09.png', label: 'Top 09', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 437 / 350 },
  { src: '/images/tops/top-10.png', label: 'Top 10', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 1 },
]

const BOTTOMS: Garment[] = [
  { src: '/images/bottoms/bottom-01.png', label: 'Bottom 01', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 1 },
  { src: '/images/bottoms/bottom-02.png', label: 'Bottom 02', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 172 / 222 },
  { src: '/images/bottoms/bottom-03.png', label: 'Bottom 03', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 454 / 341 },
  { src: '/images/bottoms/bottom-04.png', label: 'Bottom 04', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 386 / 290, phoneScale: 1.065 },
  { src: '/images/bottoms/bottom-05.png', label: 'Bottom 05', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 1, phoneScale: 0.82 },
  { src: '/images/bottoms/bottom-06.png', label: 'Bottom 06', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 229 / 258 },
  { src: '/images/bottoms/bottom-07.png', label: 'Bottom 07', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 489 / 382, phoneScale: 1.14 },
  { src: '/images/bottoms/bottom-08.png', label: 'Bottom 08', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 1 },
  { src: '/images/bottoms/bottom-09.png', label: 'Bottom 09', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 1 },
  { src: '/images/bottoms/bottom-10.png', label: 'Bottom 10', visualScale: 1, offsetX: 0, offsetY: 0, ratio: 1 },
]

const TOP_SLOTS: Record<number, Slot> = {
  [-3]: { cx: -80, y: 270 * SY, w: 170, h: 210, brightness: 0.12, z: 0 },
  [-2]: { cx: 163, y: 261 * SY, w: 240, h: 250, brightness: 0.3, z: 1 },
  [-1]: { cx: 437, y: 251 * SY, w: 226, h: 265, brightness: 0.5, z: 3 },
  [0]: { cx: 683, y: 208 * SY, w: 297, h: 283, brightness: 1, z: 6 },
  [1]: { cx: 942, y: 249 * SY, w: 241, h: 250, brightness: 0.5, z: 3 },
  [2]: { cx: 1200, y: 258 * SY, w: 200, h: 250, brightness: 0.3, z: 1 },
  [3]: { cx: 1446, y: 270 * SY, w: 170, h: 210, brightness: 0.12, z: 0 },
}

const BOTTOM_SLOTS: Record<number, Slot> = {
  [-3]: { cx: -80, y: 330 * SY, w: 180, h: 210, brightness: 0.12, z: 0 },
  [-2]: { cx: 174, y: 320 * SY, w: 250, h: 250, brightness: 0.3, z: 1 },
  [-1]: { cx: 440, y: 334 * SY, w: 230, h: 250, brightness: 0.5, z: 3 },
  [0]: { cx: 683, y: 306 * SY, w: 351, h: 455, brightness: 1, z: 6 },
  [1]: { cx: 960, y: 338 * SY, w: 320, h: 430, brightness: 0.5, z: 3 },
  [2]: { cx: 1200, y: 350 * SY, w: 211, h: 230, brightness: 0.3, z: 1 },
  [3]: { cx: 1446, y: 350 * SY, w: 180, h: 210, brightness: 0.12, z: 0 },
}

function wrapIndex(value: number, length = ITEM_COUNT) {
  return ((value % length) + length) % length
}

function wrapSlot(slot: number) {
  let next = slot
  while (next > ITEM_COUNT / 2) next -= ITEM_COUNT
  while (next < -ITEM_COUNT / 2) next += ITEM_COUNT
  return next
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function mixSlot(a: Slot, b: Slot, t: number): Slot {
  return {
    cx: lerp(a.cx, b.cx, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
    brightness: lerp(a.brightness, b.brightness, t),
    z: Math.round(lerp(a.z, b.z, t)),
  }
}

function slotAt(map: Record<number, Slot>, slot: number): Slot {
  const from = Math.floor(slot)
  const to = Math.ceil(slot)
  const t = slot - from
  const a = map[from] ?? map[slot > 0 ? 3 : -3]
  const b = map[to] ?? map[slot > 0 ? 3 : -3]
  if (!a || !b) return map[0]!
  if (t === 0) return a
  return mixSlot(a, b, t)
}

function easeWardrobe(t: number) {
  const x = clamp(t)
  const cx = 3 * 0.65
  const bx = 3 * (0.35 - 0.65) - cx
  const ax = 1 - cx - bx
  const cy = 0
  const by = 3 * (1 - 0) - cy
  const ay = 1 - cy - by
  let u = x
  for (let i = 0; i < 6; i += 1) {
    const current = ((ax * u + bx) * u + cx) * u - x
    const dx = (3 * ax * u + 2 * bx) * u + cx
    if (Math.abs(dx) < 1e-6) break
    u -= current / dx
  }
  return ((ay * u + by) * u + cy) * u
}

function Chevron({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 25 36" className="wardrobe-chevron" aria-hidden="true">
      {direction === 'prev' ? (
        <path d="M17.5 4.5L6.5 18l11 13.5" />
      ) : (
        <path d="M7.5 4.5L18.5 18l-11 13.5" />
      )}
    </svg>
  )
}

const PHONE_QUERY = '(max-width: 700px)'

type PhoneFrame = {
  tops: Record<number, Slot>
  bottoms: Record<number, Slot>
  topRow: number
  bottomRow: number
}

function phoneFrame(width: number, height: number): PhoneFrame {
  const arrow = 44
  const titleH = 46
  const rowGap = 12
  const doneGap = 14
  const doneH = 48
  const chrome = titleH + rowGap + doneGap + doneH
  const topAspect = Math.max(...TOPS.map((item) => item.ratio))
  const bottomAspect = Math.max(...BOTTOMS.map((item) => item.ratio * (item.phoneScale ?? 1)))
  let innerW = Math.max(120, width - arrow * 2)
  let centerW = innerW * 0.4
  let sideW = innerW * 0.3
  let topH = centerW * topAspect
  let bottomH = centerW * bottomAspect
  const clothes = topH + bottomH
  const limit = Math.max(160, height - chrome - 24)
  if (clothes > limit) {
    const scale = limit / clothes
    centerW *= scale
    sideW *= scale
    topH *= scale
    bottomH *= scale
  }
  const xAt = (t: number) => arrow + innerW * t
  const xs: Record<number, number> = {
    [-3]: xAt(-0.45),
    [-2]: xAt(-0.18),
    [-1]: xAt(0.17),
    [0]: xAt(0.5),
    [1]: xAt(0.83),
    [2]: xAt(1.18),
    [3]: xAt(1.45),
  }
  const tone = (key: number) =>
    key === 0 ? 1 : Math.abs(key) === 1 ? 0.55 : Math.abs(key) === 2 ? 0.3 : 0.12
  const depth = (key: number) => (key === 0 ? 6 : Math.abs(key) === 1 ? 3 : 1)
  const tops: Record<number, Slot> = {}
  const bottoms: Record<number, Slot> = {}
  for (const key of [-3, -2, -1, 0, 1, 2, 3]) {
    const selected = key === 0
    const widthFor = selected ? centerW : sideW
    tops[key] = {
      cx: xs[key] ?? 0,
      y: topH / 2,
      w: widthFor,
      h: widthFor * topAspect,
      brightness: tone(key),
      z: depth(key),
    }
    bottoms[key] = {
      cx: xs[key] ?? 0,
      y: bottomH / 2,
      w: widthFor,
      h: widthFor * bottomAspect,
      brightness: tone(key),
      z: depth(key),
    }
  }
  return { tops, bottoms, topRow: topH, bottomRow: bottomH }
}

function useWardrobeStage() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({
    phone: false,
    hostW: 0,
    hostH: 0,
    scale: 1,
  })

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    const media = window.matchMedia(PHONE_QUERY)
    const update = () => {
      const phone = media.matches
      const hostW = host.clientWidth
      const hostH = host.clientHeight
      const scale =
        phone || hostW < 1 || hostH < 1
          ? 1
          : Math.min(hostW / CANVAS_WIDTH, hostH / CANVAS_HEIGHT)
      setStage({ phone, hostW, hostH, scale })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(host)
    media.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return { hostRef, ...stage }
}

function useRowCarousel(initialIndex: number, compact: boolean) {
  const [index, setIndex] = useState(initialIndex)
  const [visual, setVisual] = useState(initialIndex)
  const busyRef = useRef(false)
  const frameRef = useRef(0)
  const indexRef = useRef(index)
  indexRef.current = index

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  const jump = (next: number) => {
    cancelAnimationFrame(frameRef.current)
    busyRef.current = false
    const wrapped = wrapIndex(next)
    indexRef.current = wrapped
    setIndex(wrapped)
    setVisual(wrapped)
  }

  const move = (dir: -1 | 1) => {
    if (busyRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = indexRef.current
    const to = from + dir
    if (reduced) {
      const next = wrapIndex(to)
      indexRef.current = next
      setIndex(next)
      setVisual(next)
      return
    }

    busyRef.current = true
    const started = performance.now()
    const tick = (now: number) => {
      const t = easeWardrobe((now - started) / ANIM_MS)
      if (t >= 1) {
        const next = wrapIndex(to)
        indexRef.current = next
        setIndex(next)
        setVisual(next)
        busyRef.current = false
        return
      }
      setVisual(from + dir * t)
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
  }

  const span = compact ? 1 : 2

  const items = Array.from({ length: ITEM_COUNT }, (_, itemIndex) => {
    const slot = wrapSlot(itemIndex - visual)
    return { itemIndex, slot, visible: Math.abs(slot) <= span + 1 }
  })

  return { index, visual, items, span, move, jump, busy: () => busyRef.current }
}

export function Wardrobe({ enabled, reveal, exiting = false, onFinished }: WardrobeProps) {
  const { hostRef, phone, hostW, hostH, scale } = useWardrobeStage()
  const frame = phone && hostW > 0 && hostH > 0 ? phoneFrame(hostW, hostH) : null
  const [compact, setCompact] = useState(false)
  const tops = useRowCarousel(2, compact)
  const bottoms = useRowCarousel(2, compact)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const skipSaveRef = useRef(true)

  useEffect(() => {
    const outfit = loadOutfit()
    tops.jump(outfit.selectedTopIndex)
    bottoms.jump(outfit.selectedBottomIndex)
    const media = window.matchMedia('(max-width: 800px)')
    const onMedia = () => setCompact(media.matches)
    onMedia()
    media.addEventListener('change', onMedia)
    return () => media.removeEventListener('change', onMedia)
  }, [])

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }
    saveOutfit({
      selectedTopIndex: tops.index,
      selectedBottomIndex: bottoms.index,
    })
  }, [tops.index, bottoms.index])

  const interactive = enabled && reveal >= 0.98
  const titleReveal = clamp((reveal - 0.12) / 0.2)
  const topReveal = clamp((reveal - 0.32) / 0.2)
  const bottomReveal = clamp((reveal - 0.5) / 0.2)
  const controlsReveal = clamp((reveal - 0.7) / 0.18)
  const doneReveal = clamp((reveal - 0.86) / 0.14)

  const onDone = () => {
    saveOutfit({
      selectedTopIndex: tops.index,
      selectedBottomIndex: bottoms.index,
      currentInteractionScreen: 'size',
    })
    onFinished?.()
  }

  return (
    <div
      ref={hostRef}
      className={`wardrobe${interactive ? ' is-ready' : ''}${exiting ? ' is-exiting' : ''}${frame ? ' is-phone' : ''}`}
      style={{
        opacity: reveal,
        pointerEvents: interactive && !exiting ? 'auto' : 'none',
      }}
      aria-hidden={!interactive}
    >
      <div className="polka-background" aria-hidden="true" />
      <div
        className="wardrobe-shell"
        style={{
          width: frame ? hostW : CANVAS_WIDTH * scale,
          height: frame ? 'auto' : CANVAS_HEIGHT * scale,
        }}
      >
        <div
          className="wardrobe-canvas"
          style={
            {
              transform: frame ? 'none' : `scale(${scale})`,
              '--top-row': frame ? `${frame.topRow}px` : undefined,
              '--bottom-row': frame ? `${frame.bottomRow}px` : undefined,
            } as CSSProperties
          }
        >
        <h2 className="wardrobe-title" style={{ opacity: titleReveal }}>
          CHOOSE YOUR Y2K OUTFIT
        </h2>

        <GarmentRow
          rowRef={topRef}
          className="is-tops"
          label="top"
          items={TOPS}
          carousel={tops}
          slots={frame?.tops ?? TOP_SLOTS}
          anchor="center"
          fitImage={Boolean(frame)}
          reveal={topReveal}
          controls={controlsReveal}
          interactive={interactive}
          compact={compact}
        />

        <GarmentRow
          rowRef={bottomRef}
          className="is-bottoms"
          label="bottom"
          items={BOTTOMS}
          carousel={bottoms}
          slots={frame?.bottoms ?? BOTTOM_SLOTS}
          anchor={frame ? 'center' : 'top'}
          fitImage={Boolean(frame)}
          reveal={bottomReveal}
          controls={controlsReveal}
          interactive={interactive}
          compact={compact}
        />

        <button
          type="button"
          className="wardrobe-done"
          style={{ opacity: doneReveal }}
          disabled={!interactive}
          onClick={onDone}
        >
          DONE
        </button>
        </div>
      </div>
    </div>
  )
}

function GarmentRow({
  rowRef,
  className,
  label,
  items,
  carousel,
  slots,
  anchor,
  reveal,
  controls,
  interactive,
  compact,
  fitImage = false,
}: {
  rowRef: RefObject<HTMLDivElement | null>
  className: string
  label: 'top' | 'bottom'
  items: Garment[]
  carousel: ReturnType<typeof useRowCarousel>
  slots: Record<number, Slot>
  anchor: 'center' | 'top'
  reveal: number
  controls: number
  interactive: boolean
  compact: boolean
  fitImage?: boolean
}) {
  const pointerRef = useRef<{ id: number; x: number } | null>(null)
  const moveRef = useRef(carousel.move)
  moveRef.current = carousel.move

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveRef.current(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveRef.current(1)
    }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current = { id: event.pointerId, x: event.clientX }
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerRef.current
    pointerRef.current = null
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    if (dx > SWIPE_PX) moveRef.current(-1)
    if (dx < -SWIPE_PX) moveRef.current(1)
  }

  useEffect(() => {
    const node = rowRef.current
    if (!node) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) < 24 || Math.abs(event.deltaX) < Math.abs(event.deltaY)) return
      event.preventDefault()
      moveRef.current(event.deltaX > 0 ? 1 : -1)
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [rowRef])

  return (
    <div className={`wardrobe-row ${className}`} style={{ opacity: reveal }}>
      <div
        ref={rowRef}
        className="wardrobe-swipe"
        tabIndex={interactive ? 0 : -1}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerRef.current = null
        }}
      />
      <button
        type="button"
        className={`wardrobe-arrow is-${label}-prev`}
        aria-label={`Previous ${label}`}
        style={{ opacity: controls }}
        disabled={!interactive || controls < 1}
        onClick={() => carousel.move(-1)}
      >
        <Chevron direction="prev" />
      </button>

      {carousel.items.map(({ itemIndex, slot, visible }) => {
        if (!visible) return null
        const item = items[itemIndex]
        if (!item) return null
        const pos = slotAt(slots, slot)
        const hiddenFar = compact && Math.abs(slot) > 1
        const scale = item.visualScale * (fitImage ? (item.phoneScale ?? 1) : 1)
        return (
          <div
            key={item.src}
            className={`wardrobe-item${Math.abs(slot) < 0.5 ? ' is-center' : ''}`}
            style={{
              left: pos.cx + item.offsetX,
              top: pos.y + item.offsetY,
              width: pos.w * scale,
              height: (fitImage ? pos.w * item.ratio : pos.h) * scale,
              zIndex: pos.z,
              opacity: hiddenFar ? 0 : 1,
              filter: `brightness(${Math.round(pos.brightness * 100)}%)`,
              transform: anchor === 'center' ? 'translate(-50%, -50%)' : 'translate(-50%, 0)',
            }}
          >
            <img src={item.src} alt={Math.abs(slot) < 0.5 ? item.label : ''} />
          </div>
        )
      })}

      <button
        type="button"
        className={`wardrobe-arrow is-${label}-next`}
        aria-label={`Next ${label}`}
        style={{ opacity: controls }}
        disabled={!interactive || controls < 1}
        onClick={() => carousel.move(1)}
      >
        <Chevron direction="next" />
      </button>
    </div>
  )
}
