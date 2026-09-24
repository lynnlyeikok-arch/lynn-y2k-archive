import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { PageFlip } from 'page-flip/src/PageFlip'
import {
  LAST_PAGE,
  MOODBOARD_PAGE_COUNT,
  MOODBOARD_PAGES,
  PAGE_RATIO,
} from '../utils/moodboardPages'

const PAGE_W = 683
const PAGE_H = Math.round(PAGE_W / PAGE_RATIO)
const FLIP_MS = 950
const PORTRAIT_BREAKPOINT = 768
const ZOOM_STEPS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3]

type BookView = 'front-cover' | 'open-spread' | 'back-cover'

type FlipApi = {
  flipNext: (corner?: 'top' | 'bottom') => void
  flipPrev: (corner?: 'top' | 'bottom') => void
  getCurrentPageIndex: () => number
  getSettings: () => { usePortrait: boolean; minWidth: number }
  destroy: () => void
  update: () => void
}

function readPortraitMode() {
  return window.innerWidth < PORTRAIT_BREAKPOINT
}

function viewFromIndex(currentPageIndex: number): BookView {
  if (currentPageIndex === 0) return 'front-cover'
  if (currentPageIndex === MOODBOARD_PAGE_COUNT - 1) return 'back-cover'
  return 'open-spread'
}

function stepZoom(current: number, direction: 1 | -1) {
  if (direction > 0) {
    return ZOOM_STEPS.find((step) => step > current + 0.01) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
  }
  const previous = [...ZOOM_STEPS].reverse().find((step) => step < current - 0.01)
  return previous ?? ZOOM_STEPS[0]
}

function pageNumberLabel(index: number, view: BookView, portrait: boolean) {
  const total = MOODBOARD_PAGE_COUNT
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

export function MoodboardBook() {
  const hostRef = useRef<HTMLDivElement>(null)
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

    for (const page of MOODBOARD_PAGES) {
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
      width: PAGE_W,
      height: PAGE_H,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 750,
      minHeight: 160,
      maxHeight: 422,
      drawShadow: true,
      flippingTime: FLIP_MS,
      usePortrait: readPortraitMode(),
      startZIndex: 10,
      autoSize: true,
      maxShadowOpacity: 0.45,
      showCover: true,
      mobileScrollSupport: false,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 24,
      showPageCorners: true,
      disableFlipByClick: false,
      startPage: 0,
    })

    const api = pageFlip as unknown as FlipApi

    pageFlip.on('init', () => {
      if (cancelled) return
      const index = api.getCurrentPageIndex()
      setPageIndex(index)
      setBookView(viewFromIndex(index))
      setPortrait(readPortraitMode())
      setReady(true)
    })
    pageFlip.on('changeState', (event) => {
      flippingRef.current =
        event.data === 'flipping' || event.data === 'user_fold'
      if (event.data === 'read') flippingRef.current = false
    })
    pageFlip.on('flip', (event) => {
      flippingRef.current = false
      if (cancelled) return
      const index =
        typeof event.data === 'number' ? event.data : api.getCurrentPageIndex()
      setPageIndex(index)
      setBookView(viewFromIndex(index))
    })

    pageFlip.loadFromHTML(root.querySelectorAll('.moodboard-sheet'))
    flipRef.current = api

    const onResize = () => {
      try {
        const settings = api.getSettings()
        const nextPortrait = readPortraitMode()
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
        if (index < LAST_PAGE) api.flipNext('top')
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
  }, [])

  useEffect(() => {
    const probe = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void
    }
    setFullscreenAvailable(
      typeof probe.requestFullscreen === 'function' ||
        typeof probe.webkitRequestFullscreen === 'function',
    )

    const onFullscreenChange = () => {
      const viewer = document.querySelector('.moodboards-page')
      setIsFullscreen(getFullscreenElement() === viewer)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    }
  }, [])

  const zoomOut = () => setZoom((value) => stepZoom(value, -1))
  const zoomIn = () => setZoom((value) => stepZoom(value, 1))

  const toggleFullscreen = () => {
    const viewer = document.querySelector('.moodboards-page')
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

  const zoomStyle = { '--book-zoom': String(zoom) } as CSSProperties

  return (
    <>
      <div className="moodboard-book-stage">
        {!ready ? (
          <div className="moodboard-book-loading" role="status">
            Loading moodboard
          </div>
        ) : null}
        <div className="moodboard-book-wrapper">
          <div className={`moodboard-book-position is-${bookView}`}>
            <div className="moodboard-book-zoom" style={zoomStyle}>
              <div className="moodboard-book-host" ref={hostRef} />
            </div>
          </div>
        </div>
      </div>
      <div className="moodboard-bottom-controls" role="toolbar" aria-label="Moodboard controls">
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
          {pageNumberLabel(pageIndex, bookView, portrait)}
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
