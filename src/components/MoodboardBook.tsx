import { useEffect, useRef, useState } from 'react'
import { PageFlip } from 'page-flip/src/PageFlip'
import { MOODBOARD_PAGES, PAGE_RATIO } from '../utils/moodboardPages'

const PAGE_W = 683
const PAGE_H = Math.round(PAGE_W / PAGE_RATIO)
const FLIP_MS = 950
const PORTRAIT_BREAKPOINT = 768
const ZOOM_STEPS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3]

type BookPage = {
  id: string
  src: string
  label: string
  density: 'hard' | 'soft'
}

type MoodboardBookProps = {
  pages?: readonly BookPage[]
  pageWidth?: number
  pageHeight?: number
  minPageWidth?: number
  maxPageWidth?: number
  minPageHeight?: number
  maxPageHeight?: number
  portraitBreakpoint?: number | null
  fullscreenSelector?: string
  loadingLabel?: string
  controlsLabel?: string
}

type BookView = 'front-cover' | 'open-spread' | 'back-cover'

type FlipApi = {
  flipNext: (corner?: 'top' | 'bottom') => void
  flipPrev: (corner?: 'top' | 'bottom') => void
  getCurrentPageIndex: () => number
  getSettings: () => { usePortrait: boolean; minWidth: number; showPageCorners: boolean }
  startUserTouch: (pos: { x: number; y: number }) => void
  userMove: (pos: { x: number; y: number }, isTouch: boolean) => void
  userStop: (pos: { x: number; y: number }, isSwipe?: boolean) => void
  destroy: () => void
  update: () => void
}

type View = { scale: number; x: number; y: number }

const DRAG_THRESHOLD = 6
const MAX_ZOOM = ZOOM_STEPS[ZOOM_STEPS.length - 1]

function clampView(view: View, width: number, height: number): View {
  const scale = Math.min(MAX_ZOOM, Math.max(1, view.scale))
  if (scale <= 1.001) return { scale: 1, x: 0, y: 0 }
  const maxX = (width * (scale - 1)) / 2
  const maxY = (height * (scale - 1)) / 2
  return {
    scale,
    x: Math.min(maxX, Math.max(-maxX, view.x)),
    y: Math.min(maxY, Math.max(-maxY, view.y)),
  }
}

function readPortraitMode(breakpoint: number | null) {
  if (breakpoint == null) return false
  return window.innerWidth < breakpoint
}

function viewFromIndex(currentPageIndex: number, pageCount: number): BookView {
  if (currentPageIndex === 0) return 'front-cover'
  if (currentPageIndex === pageCount - 1) return 'back-cover'
  return 'open-spread'
}

function stepZoom(current: number, direction: 1 | -1) {
  if (direction > 0) {
    return ZOOM_STEPS.find((step) => step > current + 0.01) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
  }
  const previous = [...ZOOM_STEPS].reverse().find((step) => step < current - 0.01)
  return previous ?? ZOOM_STEPS[0]
}

function pageNumberLabel(index: number, view: BookView, portrait: boolean, pageCount: number) {
  const total = pageCount
  const current = index + 1
  if (view === 'open-spread' && !portrait) {
    const right = Math.min(index + 2, total)
    if (right > current) return `Pages ${current}–${right} / ${total}`
  }
  return `Page ${current} / ${total}`
}

function getFullscreenElement() {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

async function requestViewerFullscreen(element: Element) {
  const el = element as Element & {
    webkitRequestFullscreen?: () => Promise<void> | void
  }
  if (element.requestFullscreen) {
    await element.requestFullscreen()
    return
  }
  if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen()
  }
}

async function exitViewerFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void
  }
  if (document.exitFullscreen) {
    await document.exitFullscreen()
    return
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen()
  }
}

export function MoodboardBook({
  pages = MOODBOARD_PAGES,
  pageWidth = PAGE_W,
  pageHeight = PAGE_H,
  minPageWidth = 280,
  maxPageWidth = 750,
  minPageHeight = 160,
  maxPageHeight = 422,
  portraitBreakpoint = PORTRAIT_BREAKPOINT,
  fullscreenSelector = '.moodboards-page',
  loadingLabel = 'Loading moodboard',
  controlsLabel = 'Moodboard controls',
}: MoodboardBookProps = {}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const zoomElRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<View>({ scale: 1, x: 0, y: 0 })
  const resetViewRef = useRef(() => {})
  const pageCount = pages.length
  const lastPage = pageCount - 1
  const flipRef = useRef<FlipApi | null>(null)
  const flippingRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [bookView, setBookView] = useState<BookView>('front-cover')
  const [pageIndex, setPageIndex] = useState(0)
  const [portrait, setPortrait] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    const root = document.createElement('div')
    root.className = 'moodboard-book-root'
    host.appendChild(root)

    for (const page of pages) {
      const sheet = document.createElement('div')
      sheet.className = 'moodboard-sheet'
      sheet.dataset.density = page.density
      const img = document.createElement('img')
      img.src = page.src
      img.alt = page.label
      img.draggable = false
      img.decoding = 'async'
      sheet.appendChild(img)
      root.appendChild(sheet)
    }

    const pageFlip = new PageFlip(root, {
      width: pageWidth,
      height: pageHeight,
      size: 'stretch',
      minWidth: minPageWidth,
      maxWidth: maxPageWidth,
      minHeight: minPageHeight,
      maxHeight: maxPageHeight,
      drawShadow: true,
      flippingTime: FLIP_MS,
      usePortrait: readPortraitMode(portraitBreakpoint),
      startZIndex: 10,
      autoSize: true,
      maxShadowOpacity: 0.45,
      showCover: true,
      mobileScrollSupport: false,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 24,
      showPageCorners: true,
      disableFlipByClick: true,
      startPage: 0,
    })

    const api = pageFlip as unknown as FlipApi

    pageFlip.on('init', () => {
      if (cancelled) return
      const index = api.getCurrentPageIndex()
      setPageIndex(index)
      setBookView(viewFromIndex(index, pageCount))
      setPortrait(readPortraitMode(portraitBreakpoint))
      setReady(true)
    })
    pageFlip.on('changeState', (event) => {
      flippingRef.current =
        event.data === 'flipping' || event.data === 'user_fold'
      if (event.data === 'read') flippingRef.current = false
      if (event.data === 'flipping') resetViewRef.current()
    })
    pageFlip.on('flip', (event) => {
      flippingRef.current = false
      resetViewRef.current()
      if (cancelled) return
      const index =
        typeof event.data === 'number' ? event.data : api.getCurrentPageIndex()
      setPageIndex(index)
      setBookView(viewFromIndex(index, pageCount))
    })

    pageFlip.loadFromHTML(root.querySelectorAll('.moodboard-sheet'))
    flipRef.current = api

    const onResize = () => {
      try {
        const settings = api.getSettings()
        const nextPortrait = readPortraitMode(portraitBreakpoint)
        settings.usePortrait = nextPortrait
        root.style.minWidth = `${settings.minWidth * (nextPortrait ? 1 : 2)}px`
        pageFlip.update()
        if (!cancelled) setPortrait(nextPortrait)
      } catch {
        /* book may be unmounting */
      }
    }
    window.addEventListener('resize', onResize)

    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (flippingRef.current) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        const index = api.getCurrentPageIndex()
        if (index < lastPage) api.flipNext('top')
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        const index = api.getCurrentPageIndex()
        if (index > 0) api.flipPrev('top')
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKey)
      flipRef.current = null
      try {
        pageFlip.destroy()
      } catch {
        root.remove()
      }
    }
  }, [
    lastPage,
    maxPageHeight,
    maxPageWidth,
    minPageHeight,
    minPageWidth,
    pageCount,
    pageHeight,
    pageWidth,
    pages,
    portraitBreakpoint,
  ])

  useEffect(() => {
    const probe = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void
    }
    setFullscreenAvailable(
      typeof probe.requestFullscreen === 'function' ||
        typeof probe.webkitRequestFullscreen === 'function',
    )

    const onFullscreenChange = () => {
      const viewer = document.querySelector(fullscreenSelector)
      setIsFullscreen(getFullscreenElement() === viewer)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    }
  }, [fullscreenSelector])

  const applyView = (view: View) => {
    const el = zoomElRef.current
    const next = el
      ? clampView(view, el.offsetWidth, el.offsetHeight)
      : view.scale <= 1
        ? { scale: 1, x: 0, y: 0 }
        : view
    viewRef.current = next
    if (el) {
      el.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`
      el.classList.toggle('is-zoomed', next.scale > 1)
    }
    const settings = flipRef.current?.getSettings()
    if (settings) settings.showPageCorners = next.scale <= 1
    setZoom((current) => (Math.abs(current - next.scale) < 0.001 ? current : next.scale))
  }

  const zoomAt = (clientX: number, clientY: number, nextScale: number) => {
    const el = zoomElRef.current
    if (!el || el.offsetWidth < 1) return
    const current = viewRef.current
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const scale = Math.min(MAX_ZOOM, Math.max(1, nextScale))
    if (current.scale <= 1 && scale > 1) {
      const block = hostRef.current?.querySelector('.stf__block')
      if (block) {
        const blockRect = block.getBoundingClientRect()
        flipRef.current?.userMove(
          { x: blockRect.width / 2, y: blockRect.height / 2 },
          false,
        )
      }
    }
    applyView({
      scale,
      x: current.x + (clientX - centerX) * (1 - scale / current.scale),
      y: current.y + (clientY - centerY) * (1 - scale / current.scale),
    })
  }

  resetViewRef.current = () => {
    applyView({ scale: 1, x: 0, y: 0 })
  }

  useEffect(() => {
    const stage = stageRef.current
    const zoomEl = zoomElRef.current
    if (!stage || !zoomEl) return

    const pointers = new Map<number, { x: number; y: number }>()
    let drag: { x: number; y: number; moved: boolean; turning: boolean } | null = null
    let pinch: {
      dist: number
      scale: number
      x: number
      y: number
      midX: number
      midY: number
      centerX: number
      centerY: number
    } | null = null

    const bookPoint = (clientX: number, clientY: number) => {
      const block = hostRef.current?.querySelector('.stf__block')
      if (!block) return null
      const rect = block.getBoundingClientRect()
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    const onBook = (target: EventTarget | null) =>
      target instanceof Node && zoomEl.contains(target)

    const stopBookGesture = (event: Event) => {
      if (onBook(event.target)) event.stopPropagation()
    }

    const endPanCursor = () => stage.classList.remove('is-panning')

    const onWheel = (event: WheelEvent) => {
      if (!onBook(event.target) && viewRef.current.scale <= 1) return
      event.preventDefault()
      let delta = event.deltaY
      if (event.deltaMode === 1) delta *= 16
      else if (event.deltaMode === 2) delta *= window.innerHeight
      zoomAt(event.clientX, event.clientY, viewRef.current.scale * Math.exp(-delta * 0.0016))
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return
      if (flippingRef.current) return
      const zoomed = viewRef.current.scale > 1
      if (!zoomed && !onBook(event.target)) return
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      try {
        stage.setPointerCapture(event.pointerId)
      } catch {
        /* the pointer can end before capture is available */
      }
      if (pointers.size >= 2) {
        if (drag?.turning) {
          const pos = bookPoint(event.clientX, event.clientY)
          if (pos) flipRef.current?.userStop(pos)
        }
        drag = null
        endPanCursor()
        const [a, b] = [...pointers.values()]
        const rect = zoomEl.getBoundingClientRect()
        pinch = {
          dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          scale: viewRef.current.scale,
          x: viewRef.current.x,
          y: viewRef.current.y,
          midX: (a.x + b.x) / 2,
          midY: (a.y + b.y) / 2,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        }
        return
      }
      pinch = null
      drag = { x: event.clientX, y: event.clientY, moved: false, turning: false }
    }

    const onPointerMove = (event: PointerEvent) => {
      const point = pointers.get(event.pointerId)
      if (!point) return
      if (pointers.size >= 2 && pinch) {
        point.x = event.clientX
        point.y = event.clientY
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1
        const midX = (a.x + b.x) / 2
        const midY = (a.y + b.y) / 2
        const scale = pinch.scale * (dist / pinch.dist)
        const offsetX = (pinch.midX - pinch.centerX) / pinch.scale
        const offsetY = (pinch.midY - pinch.centerY) / pinch.scale
        applyView({
          scale,
          x: pinch.x + (midX - offsetX * scale - pinch.centerX),
          y: pinch.y + (midY - offsetY * scale - pinch.centerY),
        })
        return
      }
      if (!drag) return
      const dx = event.clientX - point.x
      const dy = event.clientY - point.y
      const distance = Math.hypot(event.clientX - drag.x, event.clientY - drag.y)
      if (!drag.moved && distance < DRAG_THRESHOLD) return
      if (!drag.moved) {
        drag.moved = true
        if (viewRef.current.scale > 1) {
          stage.classList.add('is-panning')
        } else {
          const pos = bookPoint(drag.x, drag.y)
          if (pos && flipRef.current) {
            flipRef.current.startUserTouch(pos)
            drag.turning = true
          }
        }
      }
      point.x = event.clientX
      point.y = event.clientY
      if (viewRef.current.scale > 1) {
        applyView({
          scale: viewRef.current.scale,
          x: viewRef.current.x + dx,
          y: viewRef.current.y + dy,
        })
      } else if (drag.turning) {
        const pos = bookPoint(event.clientX, event.clientY)
        if (pos) flipRef.current?.userMove(pos, event.pointerType !== 'mouse')
      }
    }

    const finishPointer = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return
      pointers.delete(event.pointerId)
      if (pointers.size >= 2) return
      if (pointers.size === 1) {
        pinch = null
        const remaining = [...pointers.values()][0]
        drag = { x: remaining.x, y: remaining.y, moved: true, turning: false }
        if (viewRef.current.scale > 1) stage.classList.add('is-panning')
        return
      }
      const finished = drag
      drag = null
      pinch = null
      endPanCursor()
      if (!finished) return
      if (!finished.moved && viewRef.current.scale < MAX_ZOOM) {
        zoomAt(finished.x, finished.y, stepZoom(viewRef.current.scale, 1))
        return
      }
      if (finished.turning) {
        const pos = bookPoint(event.clientX, event.clientY)
        if (pos) flipRef.current?.userStop(pos)
      }
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', finishPointer)
    stage.addEventListener('pointercancel', finishPointer)
    stage.addEventListener('mousedown', stopBookGesture, true)
    stage.addEventListener('touchstart', stopBookGesture, true)
    return () => {
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', finishPointer)
      stage.removeEventListener('pointercancel', finishPointer)
      stage.removeEventListener('mousedown', stopBookGesture, true)
      stage.removeEventListener('touchstart', stopBookGesture, true)
      endPanCursor()
    }
  }, [])

  const zoomByButton = (direction: 1 | -1) => {
    const stage = stageRef.current?.getBoundingClientRect()
    const x = stage ? stage.left + stage.width / 2 : window.innerWidth / 2
    const y = stage ? stage.top + stage.height / 2 : window.innerHeight / 2
    zoomAt(x, y, stepZoom(viewRef.current.scale, direction))
  }

  const zoomOut = () => zoomByButton(-1)
  const zoomIn = () => zoomByButton(1)

  const toggleFullscreen = () => {
    const viewer = document.querySelector(fullscreenSelector)
    if (!viewer || !fullscreenAvailable) return
    try {
      const request = getFullscreenElement() === viewer
        ? exitViewerFullscreen()
        : requestViewerFullscreen(viewer)
      void Promise.resolve(request).catch(() => {
        /* fullscreen can be blocked by the browser */
      })
    } catch {
      /* fullscreen can be unavailable */
    }
  }

  return (
    <>
      <div className="moodboard-book-stage" ref={stageRef}>
        {!ready ? (
          <div className="moodboard-book-loading" role="status">
            {loadingLabel}
          </div>
        ) : null}
        <div className="moodboard-book-wrapper">
          <div className={`moodboard-book-position is-${bookView}`}>
            <div className="moodboard-book-zoom" ref={zoomElRef}>
              <div className="moodboard-book-host" ref={hostRef} />
            </div>
          </div>
        </div>
      </div>
      <div className="moodboard-bottom-controls" role="toolbar" aria-label={controlsLabel}>
        <button
          type="button"
          className="moodboard-control-button"
          aria-label="Zoom out"
          disabled={zoom <= 1}
          onClick={zoomOut}
        >
          −
        </button>
        <button
          type="button"
          className="moodboard-control-button"
          aria-label="Zoom in"
          disabled={zoom >= 3}
          onClick={zoomIn}
        >
          +
        </button>
        <div className="moodboard-page-indicator" aria-live="polite">
          {pageNumberLabel(pageIndex, bookView, portrait, pageCount)}
        </div>
        <button
          type="button"
          className="moodboard-control-button"
          aria-label="Content"
          disabled
          aria-disabled="true"
          title="Content navigation will be added next"
        >
          Content
        </button>
        <button
          type="button"
          className="moodboard-control-button"
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          disabled={!fullscreenAvailable}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>
    </>
  )
}
