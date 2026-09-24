import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useScrollProgress } from '../hooks/useScrollProgress'
import {
  QUOTE_STAGES,
  TEXT_FLOW,
  WARDROBE_START,
  YEAR_STAGES,
  clamp,
  holdOpacity,
  neighborOverlap,
  quoteMotion,
  yearMotion,
} from '../utils/timelineProgress'
import { TimeTunnel } from './TimeTunnel'
import { Wardrobe } from './Wardrobe'
import { SizeJourney } from './SizeJourney'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function yearStyle(motion: ReturnType<typeof yearMotion>, millenium: boolean) {
  return {
    opacity: motion.opacity,
    transform: `translate(-50%, -50%) scale(${motion.scale})`,
    filter: motion.blur > 0.15 ? `blur(${motion.blur}px)` : 'none',
    letterSpacing: `${motion.letterSpacing}em`,
    textShadow: millenium
      ? `0 0 ${22 + motion.glow * 16}px rgba(255, 243, 250, ${0.7 + motion.glow * 0.25}), 0 0 ${48 + motion.pulse * 80}px rgba(255, 62, 165, 0.8), 4px 4px 0 #4a0b29`
      : undefined,
    pointerEvents: motion.opacity > 0.45 ? 'auto' : 'none',
  } as const
}

function quoteStyle(motion: ReturnType<typeof quoteMotion>) {
  return {
    opacity: motion.opacity,
    transform: `translate(-50%, calc(-50% + ${motion.y}px)) scale(${motion.scale})`,
    filter: motion.blur > 0.15 ? `blur(${motion.blur}px)` : 'none',
    letterSpacing: `${motion.letterSpacing}em`,
    pointerEvents: motion.opacity > 0.45 ? 'auto' : 'none',
  } as const
}

export function TimeTravel() {
  const navigate = useNavigate()
  const trackRef = useRef<HTMLElement>(null)
  const [track, setTrack] = useState<HTMLElement | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [entry, setEntry] = useState(0)
  const [afterWardrobe, setAfterWardrobe] = useState(false)
  const progress = useScrollProgress(track, true)

  const skipIntro = () => {
    document.documentElement.classList.remove('is-timeline')
    document.body.classList.remove('is-timeline')
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    window.scrollTo(0, 0)
    void navigate({
      to: '/intro',
      hash: 'intro',
      replace: true,
      resetScroll: true,
    })
  }

  useEffect(() => {
    setTrack(trackRef.current)
    setReducedMotion(prefersReducedMotion())
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setEntry(1)
      return
    }

    let frame = 0
    const started = performance.now()
    const tick = (now: number) => {
      const next = clamp((now - started) / 900)
      setEntry(next)
      if (next < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reducedMotion])

  const wardrobeReveal = clamp((progress - WARDROBE_START) / (1 - WARDROBE_START))
  const dotsReveal = clamp((progress - WARDROBE_START) / 0.04)
  const instructionOpacity = holdOpacity(progress, 0, 0.04, 0, 0.45) * (0.35 + entry * 0.65)
  const openingMix = clamp(1 - Math.max(entry, progress / 0.04))

  return (
    <>
      {!afterWardrobe ? (
        <button
          type="button"
          className="intro-close-button"
          aria-label="Skip intro and go to Home"
          title="Skip introduction"
          onClick={skipIntro}
        >
          <img src="/assets/close-button-white.png" alt="" draggable={false} />
        </button>
      ) : null}
    <section ref={trackRef} className="timeline-track" aria-label="Y2K fashion timeline">
      <div className="timeline-sticky">
        <div
          className="timeline-bg"
          style={{
            opacity: 1,
            background: `
              radial-gradient(circle at 50% 50%,
                #6a123d 0%,
                #3e0a25 38%,
                #210611 75%,
                #16030c 100%),
              linear-gradient(rgba(229, 69, 106, ${openingMix * 0.85}), rgba(229, 69, 106, ${openingMix * 0.85}))
            `,
          }}
          aria-hidden="true"
        />
        <div
          className={`timeline-stars${reducedMotion ? ' is-static' : ''}`}
          style={{ opacity: openingMix * 0.55 + (reducedMotion ? 0.18 : 0) }}
          aria-hidden="true"
        />

        <div className="timeline-motion" aria-hidden="true">
          {reducedMotion ? (
            <div className="timeline-static-burst" />
          ) : (
            <TimeTunnel progress={progress} entry={entry} reducedMotion={reducedMotion} />
          )}
        </div>

        <div className="timeline-dots polka-background" style={{ opacity: dotsReveal }} aria-hidden="true" />

        <div className="timeline-text">
          <p className="timeline-instruction" style={{ opacity: instructionOpacity }}>
            SCROLL THROUGH TIME ↓
          </p>

          {YEAR_STAGES.map((stage) => {
            const span = stage.end - stage.start
            const overlap = neighborOverlap(stage.start, stage.end, TEXT_FLOW)
            const millenium = stage.year === '2000'
            const motion = yearMotion(
              progress,
              stage.start,
              stage.end,
              overlap.in > 0 ? Math.max(overlap.in, span * 0.125) : 0,
              Math.max(overlap.out, span * 0.125),
              millenium,
            )
            return (
              <p
                key={stage.year}
                className={`timeline-year${stage.glow ? ' is-glow' : ''}`}
                style={yearStyle(motion, millenium)}
              >
                {millenium && motion.glow > 0.35 && !reducedMotion ? (
                  <span className="timeline-year-sparkle" style={{ opacity: 0.35 + motion.pulse * 8 }} aria-hidden="true">
                    ✦
                  </span>
                ) : null}
                {stage.year}
              </p>
            )
          })}

          {QUOTE_STAGES.map((stage) => {
            const span = stage.end - stage.start
            const overlap = neighborOverlap(stage.start, stage.end, TEXT_FLOW)
            const motion = quoteMotion(
              progress,
              stage.start,
              stage.end,
              overlap.in > 0 ? Math.max(overlap.in, span * 0.125) : 0,
              Math.max(overlap.out, span * 0.125),
            )
            const burst = stage.id === 'back' && motion.opacity > 0.35 && !reducedMotion
            return (
              <div key={stage.id} className={`timeline-quote is-${stage.size}`} style={quoteStyle(motion)}>
                {burst ? (
                  <span className="timeline-quote-burst" aria-hidden="true">
                    ✦ ✧ ♥ ✦
                  </span>
                ) : null}
                {stage.groups.map((group, index) => {
                  const lineMotion =
                    index === 0
                      ? motion
                      : quoteMotion(progress, stage.start + span * 0.14, stage.end, 0, Math.max(overlap.out, span * 0.125))
                  return (
                    <p
                      key={group.join(' ')}
                      className="timeline-quote-line"
                      style={
                        index === 0
                          ? undefined
                          : {
                              opacity: lineMotion.opacity,
                              transform: `translateY(${Math.min(18, lineMotion.y)}px)`,
                            }
                      }
                    >
                      {group.join(' ')}
                    </p>
                  )
                })}
              </div>
            )
          })}
        </div>

        <Wardrobe
          enabled={progress >= 0.992}
          reveal={wardrobeReveal}
          exiting={afterWardrobe}
          onFinished={() => setAfterWardrobe(true)}
        />
        {afterWardrobe ? <SizeJourney onBackToWardrobe={() => setAfterWardrobe(false)} /> : null}
      </div>
    </section>
    </>
  )
}
