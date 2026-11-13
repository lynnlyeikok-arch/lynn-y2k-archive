import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  loadOutfit,
  saveOutfit,
  type InteractionScreen,
  type SizeId,
} from '../utils/outfitState'
import {
  YES_DETECT_RADIUS,
  YES_ESCAPE_LIMIT,
  YES_MOVE_MS,
  NO_GROW_MS,
  distanceToRect,
  maxNoScale,
  noScaleForCount,
  pickYesPosition,
  scaledBox,
  type Point,
} from '../utils/yesChase'

type SizeJourneyProps = {
  onBackToWardrobe: () => void
}

const CANVAS_WIDTH = 1366
const CANVAS_HEIGHT = 765
const SY = CANVAS_HEIGHT / 768
const SIZE_HOLD_MS = 600
const SIZE_BUTTONS = [
  { id: 'XS' as const, left: 392, top: 391 * SY, width: 76 },
  { id: 'S' as const, left: 519, top: 391 * SY, width: 75 },
  { id: 'M' as const, left: 645, top: 391 * SY, width: 76 },
  { id: 'L' as const, left: 772, top: 391 * SY, width: 75 },
  { id: 'XL' as const, left: 898, top: 391 * SY, width: 76 },
]
const YES_HOME = { left: 505, top: 481 * SY }
const NO_HOME = { left: 694, top: 481 * SY }
const CHOICE_SIZE = { width: 167, height: 63 }
const PHONE_CHOICE = { width: 112, height: 64, fontSize: 28 }

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useCanvasScale(width: number, height: number) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [view, setView] = useState({ w: width, h: height })
  const [phone, setPhone] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const media = window.matchMedia('(max-width: 700px)')
    const update = () => {
      setPhone(media.matches)
      setScale(Math.min(host.clientWidth / width, host.clientHeight / height))
      setView({ w: host.clientWidth, h: host.clientHeight })
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
  }, [width, height])

  return { hostRef, scale, view, phone }
}

function mapCanvasPoint(point: Point, scale: number, view: { w: number; h: number }): Point {
  const offsetX = (view.w - CANVAS_WIDTH * scale) / 2
  const offsetY = (view.h - CANVAS_HEIGHT * scale) / 2
  return {
    left: offsetX + point.left * scale,
    top: offsetY + point.top * scale,
  }
}

export function SizeJourney({ onBackToWardrobe }: SizeJourneyProps) {
  const navigate = useNavigate()
  const { hostRef, scale, view, phone } = useCanvasScale(CANVAS_WIDTH, CANVAS_HEIGHT)
  const [screen, setScreen] = useState<InteractionScreen>('size')
  const [selectedSize, setSelectedSize] = useState<SizeId | null>(null)
  const [escapeCount, setEscapeCount] = useState(0)
  const [yesPos, setYesPos] = useState(YES_HOME)
  const [yesRotate, setYesRotate] = useState(0)
  const [yesHopping, setYesHopping] = useState(false)
  const [noGrowing, setNoGrowing] = useState(false)
  const [reduced, setReduced] = useState(false)
  const holdTimer = useRef(0)
  const hopTimer = useRef(0)
  const growTimer = useRef(0)
  const pointerKind = useRef('mouse')
  const escapeRef = useRef(0)
  const yesPosRef = useRef(YES_HOME)
  const lastDodgeAt = useRef(0)
  const lastZone = useRef<number | null>(null)
  const prevZone = useRef<number | null>(null)
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const yesBtnRef = useRef<HTMLButtonElement>(null)
  const noBtnRef = useRef<HTMLButtonElement>(null)
  const questionRef = useRef<HTMLDivElement>(null)
  escapeRef.current = escapeCount
  yesPosRef.current = yesPos

  const yesHome = mapCanvasPoint(YES_HOME, scale, view)
  const noHome = mapCanvasPoint(NO_HOME, scale, view)
  const btnW = CHOICE_SIZE.width * scale
  const btnH = CHOICE_SIZE.height * scale
  const chasing = screen === 'question' && escapeCount > 0
  const yesViewport = chasing ? yesPos : yesHome

  const resetChase = (home: Point) => {
    escapeRef.current = 0
    yesPosRef.current = home
    lastDodgeAt.current = 0
    lastZone.current = null
    prevZone.current = null
    setEscapeCount(0)
    setYesPos(home)
    setYesRotate(0)
    setYesHopping(false)
    setNoGrowing(false)
  }

  useEffect(() => {
    setReduced(prefersReducedMotion())
    const saved = loadOutfit()
    if (saved.selectedSize) setSelectedSize(saved.selectedSize)
    saveOutfit({ currentInteractionScreen: 'size', yesEscapeCount: 0 })
    window.history.pushState({ lynnJourney: 'size' }, '')
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(holdTimer.current)
      window.clearTimeout(hopTimer.current)
      window.clearTimeout(growTimer.current)
      document.documentElement.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const onPop = () => {
      setScreen((current) => {
        if (current === 'size') {
          saveOutfit({ currentInteractionScreen: 'wardrobe' })
          onBackToWardrobe()
          return current
        }
        if (current === 'yesResult' || current === 'noResult') {
          resetChase(yesHome)
          saveOutfit({ currentInteractionScreen: 'question', yesEscapeCount: 0 })
          return 'question'
        }
        saveOutfit({ currentInteractionScreen: 'size' })
        return 'size'
      })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [onBackToWardrobe, yesHome.left, yesHome.top])

  const goTo = (next: InteractionScreen) => {
    setScreen(next)
    saveOutfit({ currentInteractionScreen: next })
    window.history.pushState({ lynnJourney: next }, '')
  }

  const onPickSize = (size: SizeId) => {
    setSelectedSize(size)
    saveOutfit({ selectedSize: size, currentInteractionScreen: 'size' })
    window.clearTimeout(holdTimer.current)
    holdTimer.current = window.setTimeout(
      () => {
        resetChase(mapCanvasPoint(YES_HOME, scale, view))
        goTo('question')
      },
      reduced ? 80 : SIZE_HOLD_MS,
    )
  }

  const resetQuestion = () => {
    resetChase(yesHome)
    saveOutfit({ yesEscapeCount: 0, currentInteractionScreen: 'question' })
    setScreen('question')
  }

  const yesCatchable = escapeCount >= YES_ESCAPE_LIMIT

  const dodgeYes = () => {
    if (screen !== 'question') return
    if (escapeRef.current >= YES_ESCAPE_LIMIT) return
    const now = performance.now()
    if (now - lastDodgeAt.current < YES_MOVE_MS) return
    lastDodgeAt.current = now

    const nextCount = escapeRef.current + 1
    const maximum = maxNoScale(view.w, view.h, btnW, btnH)
    const nextNoScale = noScaleForCount(nextCount, maximum)
    const questionBox = questionRef.current?.getBoundingClientRect()
    const hostBox = hostRef.current?.getBoundingClientRect()
    const yesBox = yesBtnRef.current?.getBoundingClientRect()
    const noBoxRect = noBtnRef.current?.getBoundingClientRect()
    const question = questionBox && hostBox
      ? {
          left: questionBox.left - hostBox.left,
          top: questionBox.top - hostBox.top,
          width: questionBox.width,
          height: questionBox.height,
        }
      : {
          left: (view.w - 646 * scale) / 2,
          top: (view.h - CANVAS_HEIGHT * scale) / 2 + 232 * scale,
          width: 646 * scale,
          height: 220 * scale,
        }
    const liveYes = phone && yesBox && hostBox
      ? { left: yesBox.left - hostBox.left, top: yesBox.top - hostBox.top }
      : { left: yesViewport.left, top: yesViewport.top }
    const liveW = phone && yesBox ? yesBox.width : btnW
    const liveH = phone && yesBox ? yesBox.height : btnH
    const grown = nextNoScale / Math.max(noScale, 1)
    const noBox = phone && noBoxRect && hostBox
      ? {
          left: noBoxRect.left - hostBox.left - (noBoxRect.width * (grown - 1)) / 2,
          top: noBoxRect.top - hostBox.top - (noBoxRect.height * (grown - 1)) / 2,
          width: noBoxRect.width * grown,
          height: noBoxRect.height * grown,
        }
      : scaledBox(noHome.left, noHome.top, btnW, btnH, nextNoScale)
    const previous = {
      left: liveYes.left,
      top: liveYes.top,
      width: liveW,
      height: liveH,
    }
    const picked = pickYesPosition({
      viewW: view.w,
      viewH: view.h,
      btnW: liveW,
      btnH: liveH,
      current: liveYes,
      pointer: pointerRef.current,
      exclusions: [question, noBox, previous],
      lastZone: lastZone.current,
      prevZone: prevZone.current,
    })

    prevZone.current = lastZone.current
    lastZone.current = picked.zone
    escapeRef.current = nextCount
    yesPosRef.current = picked.point
    setYesPos(picked.point)
    setYesRotate(picked.rotate)
    setEscapeCount(nextCount)
    setYesHopping(true)
    setNoGrowing(true)
    saveOutfit({ yesEscapeCount: nextCount })
    window.clearTimeout(hopTimer.current)
    window.clearTimeout(growTimer.current)
    hopTimer.current = window.setTimeout(() => setYesHopping(false), YES_MOVE_MS)
    growTimer.current = window.setTimeout(() => setNoGrowing(false), NO_GROW_MS)
  }

  const onQuestionPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (screen !== 'question' || event.pointerType !== 'mouse') return
    const host = hostRef.current
    if (!host) return
    const hostBox = host.getBoundingClientRect()
    pointerRef.current = { x: event.clientX - hostBox.left, y: event.clientY - hostBox.top }
    const yes = yesBtnRef.current
    if (!yes) return
    const yesBox = yes.getBoundingClientRect()
    const local = {
      left: yesBox.left - hostBox.left,
      top: yesBox.top - hostBox.top,
      width: yesBox.width,
      height: yesBox.height,
    }
    if (escapeRef.current >= YES_ESCAPE_LIMIT) return
    if (distanceToRect(pointerRef.current.x, pointerRef.current.y, local) <= YES_DETECT_RADIUS) {
      dodgeYes()
    }
  }

  const onYesPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    pointerKind.current = event.pointerType
    if (escapeRef.current >= YES_ESCAPE_LIMIT) return
    if (event.pointerType === 'mouse' || event.pointerType === 'touch' || event.pointerType === 'pen') {
      event.preventDefault()
      dodgeYes()
    }
  }

  const onYesClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) {
      goTo('yesResult')
      return
    }
    if (escapeRef.current < YES_ESCAPE_LIMIT) {
      event.preventDefault()
      return
    }
    goTo('yesResult')
  }

  const onEnter = () => {
    saveOutfit({ currentInteractionScreen: 'noResult' })
    document.documentElement.classList.remove('is-timeline')
    document.body.classList.remove('is-timeline')
    document.documentElement.style.overflow = ''
    void navigate({ to: '/intro' })
  }

  const dark = screen === 'yesResult' || screen === 'noResult'
  const maximum = maxNoScale(view.w, view.h, btnW, btnH)
  const noScale = noScaleForCount(escapeCount, maximum)
  const questionBottom =
    (view.h - CANVAS_HEIGHT * scale) / 2 + (232 + 220) * scale + 16
  const noVisualH = btnH * noScale
  const noCenterY = Math.min(
    Math.max(noHome.top + btnH / 2, questionBottom + noVisualH / 2),
    view.h - 24 - noVisualH / 2,
  )
  const noTop = noCenterY - btnH / 2

  return (
    <div
      ref={hostRef}
      className={`size-journey${phone ? ' is-phone' : ''}`}
      aria-live="polite"
      onPointerMove={onQuestionPointerMove}
    >
      <div className={`polka-background${dark ? ' is-dark' : ''}`} aria-hidden="true" />
      <div
        className="size-journey-shell"
        style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
      >
        <div className="size-journey-canvas" style={{ transform: `scale(${scale})` }}>
          <section
            className={`journey-panel is-size${screen === 'size' ? ' is-active' : ''}`}
            aria-hidden={screen !== 'size' || phone}
            inert={screen !== 'size' || phone}
          >
            <h2 className="size-title">CHOOSE YOUR SIZE</h2>
            <div className="size-row">
              {SIZE_BUTTONS.map((button) => (
                <button
                  key={button.id}
                  type="button"
                  className={`size-btn${selectedSize === button.id ? ' is-selected' : ''}`}
                  style={{
                    left: button.left,
                    top: button.top,
                    width: button.width,
                  }}
                  onClick={() => onPickSize(button.id)}
                >
                  {button.id}
                </button>
              ))}
            </div>
          </section>

          <section
            className={`journey-panel is-question${screen === 'question' ? ' is-active' : ''}`}
            aria-hidden={screen !== 'question' || phone}
            inert={screen !== 'question' || phone}
          >
            <div className="question-copy" ref={phone ? undefined : questionRef}>
              <p>ONE STANDARD SIZE ONLY</p>
              <p>You love it. But it doesn’t fit.</p>
              <p>Would you compromise your size</p>
              <p>for the clothes?</p>
            </div>
          </section>

          <section
            className={`journey-panel is-dark-copy is-yes-result${screen === 'yesResult' ? ' is-active' : ''}`}
            aria-hidden={screen !== 'yesResult' || phone}
            inert={screen !== 'yesResult' || phone}
          >
            <div className="result-copy">
              <p>You chose YES. But should loving the clothes mean</p>
              <p>compromising your size?</p>
            </div>
            <button type="button" className="think-btn" onClick={resetQuestion}>
              THINK AGAIN
            </button>
          </section>

          <section
            className={`journey-panel is-dark-copy is-no-result${screen === 'noResult' ? ' is-active' : ''}`}
            aria-hidden={screen !== 'noResult' || phone}
            inert={screen !== 'noResult' || phone}
          >
            <p className="no-copy">You chose yourself. ONE SIZE shouldn’t define your body.</p>
            <button type="button" className="enter-btn" onClick={onEnter}>
              ENTER
            </button>
          </section>
        </div>
      </div>

      {phone && screen === 'size' ? (
        <section className="size-phone" aria-label="Choose your size">
          <h2 className="size-title">CHOOSE YOUR SIZE</h2>
          <div className="size-row">
            {SIZE_BUTTONS.map((button) => (
              <button
                key={button.id}
                type="button"
                className={`size-btn${selectedSize === button.id ? ' is-selected' : ''}`}
                onClick={() => onPickSize(button.id)}
              >
                {button.id}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {phone && screen === 'question' ? (
        <section className="question-phone" aria-label="One standard size only">
          <div className="question-copy" ref={questionRef}>
            <p className="question-lead">ONE STANDARD SIZE ONLY</p>
            <p>You love it. But it doesn’t fit.</p>
            <p>Would you compromise your size</p>
            <p>for the clothes?</p>
          </div>
          <div className="question-actions">
            {escapeCount === 0 ? (
              <button
                ref={yesBtnRef}
                type="button"
                className="choice-btn is-yes is-free"
                onPointerDown={onYesPointerDown}
                onClick={onYesClick}
              >
                YES
              </button>
            ) : (
              <span className="question-yes-spacer" aria-hidden="true" />
            )}
            <button
              ref={noBtnRef}
              type="button"
              className={`choice-btn is-no is-free${noGrowing && !reduced ? ' is-growing' : ''}`}
              style={{ transform: `scale(${noScale})` }}
              onClick={() => goTo('noResult')}
            >
              NO
            </button>
          </div>
        </section>
      ) : null}

      {phone && screen === 'yesResult' ? (
        <section className="result-phone" aria-label="You chose yes">
          <div className="result-copy">
            <p>You chose YES. But should loving the clothes mean</p>
            <p>compromising your size?</p>
          </div>
          <button type="button" className="think-btn" onClick={resetQuestion}>
            THINK AGAIN
          </button>
        </section>
      ) : null}

      {phone && screen === 'noResult' ? (
        <section className="result-phone" aria-label="You chose yourself">
          <p className="no-copy">You chose yourself. ONE SIZE shouldn’t define your body.</p>
          <button type="button" className="enter-btn" onClick={onEnter}>
            ENTER
          </button>
        </section>
      ) : null}

      <div
        className={`question-chase${screen === 'question' ? ' is-active' : ''}`}
        aria-hidden={screen !== 'question' || (phone && escapeCount === 0)}
        inert={screen !== 'question' || (phone && escapeCount === 0)}
      >
        {phone && escapeCount === 0 ? null : (
          <button
            ref={yesBtnRef}
            type="button"
            className={`choice-btn is-yes is-free${yesHopping && !reduced ? ' is-hopping' : ''}`}
            style={{
              left: yesViewport.left,
              top: yesViewport.top,
              width: phone ? PHONE_CHOICE.width : btnW,
              height: phone ? PHONE_CHOICE.height : btnH,
              fontSize: phone ? PHONE_CHOICE.fontSize : 33 * scale,
              ['--yes-rot' as string]: `${yesRotate}deg`,
            }}
            onPointerDown={onYesPointerDown}
            onClick={onYesClick}
          >
            YES
          </button>
        )}
        {phone ? null : (
          <button
            ref={noBtnRef}
            type="button"
            className={`choice-btn is-no is-free${noGrowing && !reduced ? ' is-growing' : ''}`}
            style={{
              left: noHome.left,
              top: noTop,
              width: btnW,
              height: btnH,
              fontSize: 33 * scale,
              transform: `scale(${noScale})`,
            }}
            onClick={() => goTo('noResult')}
          >
            NO
          </button>
        )}
        <span className="sr-only">
          {yesCatchable
            ? 'YES can now be selected.'
            : 'YES moves away from the pointer five times, then it can be selected. Keyboard users can select YES at any time.'}
        </span>
      </div>
    </div>
  )
}
