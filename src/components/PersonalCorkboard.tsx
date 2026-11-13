import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { MalaysiaClock } from './MalaysiaClock'
import type { PopupId } from './popupReturn'

const CANVAS_W = 1024.5
const CANVAS_H = 576

type CorkPiece = {
  id: string
  src: string
  x: number
  y: number
  w: number
  h: number
  rot?: number
  origin?: string
  /** Opaque click area inside the piece, as percentages. The rest of a padded SVG stays decorative. */
  hit?: { left: number; top: number; width: number; height: number }
}

type PopupZoom = {
  label: string
  to: '/creator-note' | '/digital-magazine' | '/weekly-blog'
  left: number
  top: number
  width: number
  height: number
}

/** Phone crop, as percentages of the 1024.5×576 popup viewBox. Desktop still shows the full file. */
type PopupCrop = { x: number; y: number; w: number; h: number }

const popups: Record<string, { src: string; label: string; crop?: PopupCrop; zoom?: PopupZoom & { id: PopupId } }> = {
  'id-card': {
    src: '/images/cork-parts/popup.svg',
    label: 'Personal information',
    crop: { x: 24.2, y: 24.2, w: 50.2, h: 60.5 },
    zoom: {
      id: 'id-card',
      label: 'CLICK TO SEE A NOTE FROM THE CREATOR',
      to: '/creator-note',
      left: 24.2,
      top: 24.2,
      width: 50.2,
      height: 60.5,
    },
  },
  quote: {
    src: '/images/cork-parts/popup-quote.svg',
    label: 'Quote',
    crop: { x: 26, y: 26.1, w: 53.3, h: 34.8 },
  },
  magazine: {
    src: '/images/cork-parts/popup-magazine.svg',
    label: 'Digital magazine',
    crop: { x: 38.2, y: 27.7, w: 23.3, h: 54.5 },
    zoom: {
      id: 'magazine',
      label: "CLICK TO SEE MAGAZINE'S FULL VIEW",
      to: '/digital-magazine',
      left: 38.2,
      top: 27.7,
      width: 23.3,
      height: 54.5,
    },
  },
  calendar: {
    src: '/images/cork-parts/popup-calendar.svg',
    label: 'Calendar',
    crop: { x: 28.75, y: 21.89, w: 43.69, h: 62.18 },
    zoom: {
      id: 'calendar',
      label: 'CLICK TO SEE WEEKLY BLOG',
      to: '/weekly-blog',
      left: 28.75,
      top: 21.89,
      width: 43.69,
      height: 62.18,
    },
  },
  doily: { src: '/images/cork-parts/popup-clock.svg', label: 'Malaysia live time' },
}

// Boxes are taken from Corkboard.svg image matrices and clip bounds.
// x/y is the top-left of the unrotated box. Rotation is around its centre.
const pieces: CorkPiece[] = [
  { id: 'board', src: 'board.svg', x: 90.1, y: 6.9, w: 844.1, h: 562.7 },
  // (32) uses the corkboard viewBox, with the sheet translated inside that file.
  // Scaled so its Sony photograph matches Corkboard.svg (centre 632.51, 408.06, rotation 4.494°).
  { id: 'calendar', src: 'calendar.svg', x: 420.86, y: 245.76, w: 557.12, h: 313.22, rot: 4.494, origin: '37.992% 51.816%', hit: { left: 26.5, top: 14.7, width: 53.7, height: 76 } },
  { id: 'magazine', src: 'magazine.svg', x: 150.1, y: 290.9, w: 161, h: 229.3, rot: 5.1 },
  { id: 'id-card', src: 'id-card.svg', x: 85.75, y: 28.65, w: 392.9, h: 290.7, rot: -10.8 },
  { id: 'glasses', src: 'glasses.svg', x: 113.3, y: -51.9, w: 254.7, h: 254.7 },
  { id: 'star', src: 'star.svg', x: 377.2, y: 1.2, w: 162.2, h: 162.2 },
  { id: 'star-pink', src: 'star-pink.svg', x: 488.55, y: 40.95, w: 66.7, h: 63.7, rot: -17.2 },
  { id: 'flower', src: 'flower.svg', x: 397.2, y: 80.6, w: 225.3, h: 190.8 },
  { id: 'doily', src: 'doily.svg', x: 590.2, y: 41, w: 214.8, h: 214.8 },
  { id: 'phone-silver', src: 'phone-silver.svg', x: 429.2, y: -43.7, w: 295.1, h: 295.1 },
  { id: 'keychain', src: 'keychain.svg', x: 776, y: 34, w: 171.6, h: 229 },
  { id: 'tamagotchi', src: 'tamagotchi.svg', x: 682.6, y: 58.8, w: 260.1, h: 260.1 },
  { id: 'stamp', src: 'stamp.svg', x: 573.35, y: 209, w: 82.5, h: 69.7 },
  { id: 'bill', src: 'bill.svg', x: 648, y: 218, w: 108, h: 72.7, rot: -8 },
  { id: 'bill-v', src: 'bill-v.svg', x: 742, y: 198, w: 52, h: 76.1, rot: 8 },
  { id: 'quote', src: 'quote.svg', x: 404, y: 448, w: 178, h: 51 },
  { id: 'index', src: 'index.svg', x: 376, y: 256, w: 214, h: 189.1, rot: -2 },
  { id: 'tape', src: 'tape.svg', x: 467, y: 492, w: 72, h: 15.5 },
  { id: 'kaomoji', src: 'kaomoji.svg', x: 415, y: 494, w: 148, h: 41 },
  { id: 'phone', src: 'phone.svg', x: 197.4, y: 266.3, w: 294.4, h: 294.4 },
  { id: 'clip-plaid', src: 'clip-plaid.svg', x: 238, y: 250, w: 42, h: 52, rot: 4 },
  { id: 'clip-leopard', src: 'clip-leopard.svg', x: 454, y: 220, w: 56, h: 56 },
  { id: 'clip-archive', src: 'clip-archive.svg', x: 453, y: 408, w: 60, h: 55 },
  { id: 'pin-card', src: 'pin-hot.svg', x: 113, y: 70, w: 48, h: 50, rot: -8 },
  { id: 'pin-glasses', src: 'pin-hot.svg', x: 361, y: 28, w: 48, h: 50, rot: 10 },
  { id: 'pin-doily', src: 'pin-blue.svg', x: 677, y: 59, w: 44, h: 46 },
  { id: 'pin-calendar-left', src: 'pin-pink.svg', x: 586, y: 252, w: 40, h: 60, rot: 12 },
  { id: 'pin-calendar', src: 'pin-pink.svg', x: 837, y: 277, w: 40, h: 60, rot: 14 },
]

export function PersonalCorkboard({ initialOpen = null }: { initialOpen?: string | null }) {
  const navigate = useNavigate()
  const [openId, setOpenId] = useState<string | null>(initialOpen)
  const popup = openId ? popups[openId] : null
  const scrollRef = useRef(0)

  useLayoutEffect(() => {
    if (!openId) return
    const scrollY = window.scrollY
    scrollRef.current = scrollY
    document.documentElement.classList.add('is-popup-open')
    document.body.classList.add('is-popup-open')
    window.scrollTo(0, scrollY)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.classList.remove('is-popup-open')
      document.body.classList.remove('is-popup-open')
      window.removeEventListener('keydown', onKey)
      window.scrollTo(0, scrollY)
    }
  }, [openId])

  return (
    <>
      <div className="personal-board" role="img" aria-label="Personal information corkboard">
        {pieces.map((piece, index) => {
          const style = {
            left: `${(piece.x / CANVAS_W) * 100}%`,
            top: `${(piece.y / CANVAS_H) * 100}%`,
            width: `${(piece.w / CANVAS_W) * 100}%`,
            height: `${(piece.h / CANVAS_H) * 100}%`,
            zIndex: index + 1,
            ['--rot' as string]: `${piece.rot ?? 0}deg`,
            transformOrigin: piece.origin ?? 'center',
          }
          if (piece.id === 'doily') {
            return (
              <div key={piece.id} className="personal-piece personal-clock is-interactive" style={style}>
                <img src={`/images/cork-parts/${piece.src}`} alt="" draggable={false} />
                <MalaysiaClock />
                <button
                  type="button"
                  className="personal-hit"
                  aria-label={`Open ${popups.doily.label.toLowerCase()}`}
                  onClick={() => setOpenId(piece.id)}
                />
              </div>
            )
          }
          const interactive = popups[piece.id]
          if (interactive) {
            const hit = piece.hit
            return (
              <div key={piece.id} className="personal-piece is-interactive" style={style}>
                <img src={`/images/cork-parts/${piece.src}`} alt="" draggable={false} />
                <button
                  type="button"
                  className="personal-hit"
                  style={
                    hit
                      ? { left: `${hit.left}%`, top: `${hit.top}%`, width: `${hit.width}%`, height: `${hit.height}%` }
                      : undefined
                  }
                  aria-label={`Open ${interactive.label.toLowerCase()}`}
                  onClick={() => setOpenId(piece.id)}
                />
              </div>
            )
          }
          return (
            <img
              key={piece.id}
              className="personal-piece"
              src={`/images/cork-parts/${piece.src}`}
              alt=""
              draggable={false}
              style={style}
            />
          )
        })}
      </div>
      {popup ? (
        <div className="personal-popup" role="dialog" aria-modal="true" aria-label={popup.label}>
          <div
            className={openId === 'doily' ? 'personal-popup-card is-clock' : 'personal-popup-card'}
            style={
              popup.crop
                ? ({
                    '--crop-x': popup.crop.x / 100,
                    '--crop-y': popup.crop.y / 100,
                    '--crop-w': popup.crop.w / 100,
                    '--crop-h': popup.crop.h / 100,
                  } as CSSProperties)
                : undefined
            }
          >
            <div className="personal-popup-fit">
              <img src={popup.src} alt="" draggable={false} />
              {openId === 'doily' ? (
                <>
                  <span className="personal-popup-clock-mask" aria-hidden="true" />
                  <MalaysiaClock />
                </>
              ) : null}
              {popup.zoom ? (
                <button
                  type="button"
                  className="personal-popup-zoom"
                  style={
                    {
                      '--x': popup.zoom.left,
                      '--y': popup.zoom.top,
                      '--w': popup.zoom.width,
                      '--h': popup.zoom.height,
                    } as CSSProperties
                  }
                  onClick={() =>
                    navigate({
                      to: popup.zoom!.to,
                      state: { fromPopup: popup.zoom!.id, scrollY: scrollRef.current },
                    })
                  }
                >
                  <span className="personal-popup-zoom-frame">
                    <img src={popup.src} alt="" draggable={false} />
                  </span>
                  <span className="personal-popup-zoom-label">{popup.zoom.label}</span>
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className={openId === 'doily' ? 'personal-popup-close is-clock' : 'personal-popup-close'}
              aria-label="Close"
              onClick={() => setOpenId(null)}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
