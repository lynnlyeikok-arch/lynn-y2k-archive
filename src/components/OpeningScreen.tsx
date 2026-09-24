import { useEffect, useRef, useState } from 'react'
import { TimeTravel } from './TimeTravel'

const SPARKLES = [
  { top: '12%', left: '18%', fontSize: 14, delay: '0s' },
  { top: '22%', left: '78%', fontSize: 10, delay: '0.5s' },
  { top: '68%', left: '12%', fontSize: 12, delay: '0.9s' },
  { top: '74%', left: '84%', fontSize: 9, delay: '0.25s' },
  { top: '40%', left: '8%', fontSize: 8, delay: '1.2s' },
  { top: '44%', left: '90%', fontSize: 11, delay: '0.7s' },
]

type Phase = 'opening' | 'leaving' | 'timeline'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function OpeningScreen() {
  const [phase, setPhase] = useState<Phase>('opening')
  const [pressed, setPressed] = useState(false)
  const timers = useRef<number[]>([])

  function startTransition() {
    if (phase !== 'opening') return

    setPressed(true)

    const fadeMs = prefersReducedMotion() ? 0 : 700
    const leaveTimer = window.setTimeout(() => {
      setPhase('leaving')
      document.documentElement.classList.add('is-timeline')
      document.body.classList.add('is-timeline')
      window.scrollTo(0, 0)
      const timelineTimer = window.setTimeout(() => {
        setPhase('timeline')
        setPressed(false)
        window.scrollTo(0, 0)
      }, fadeMs)
      timers.current.push(timelineTimer)
    }, prefersReducedMotion() ? 0 : 180)
    timers.current.push(leaveTimer)
  }

  useEffect(() => {
    return () => {
      for (const timer of timers.current) window.clearTimeout(timer)
      document.documentElement.classList.remove('is-timeline')
      document.body.classList.remove('is-timeline')
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      {phase !== 'timeline' ? (
        <div className={`opening-stage${phase === 'leaving' ? ' is-overlay is-leaving' : ''}`}>
          <div className="opening-canvas">
          <section
            className={`opening-screen${phase === 'leaving' ? ' is-leaving' : ''}`}
            aria-label="Lynn Archive 2000 opening screen"
          >
            <div className="landing-sparkles" aria-hidden="true">
              {SPARKLES.map((sparkle) => (
                <span
                  key={`${sparkle.top}-${sparkle.left}`}
                  className="landing-sparkle"
                  style={{
                    top: sparkle.top,
                    left: sparkle.left,
                    fontSize: sparkle.fontSize,
                    animationDelay: sparkle.delay,
                  }}
                >
                  ✦
                </span>
              ))}
            </div>

            <div className="landing-hero">
              <h1 className="landing-title">Lynn Archive 2000</h1>
              <p className="landing-welcome">ようこそ ★ リンのへやへ</p>
              <p className="landing-since">Since 2000</p>
              <div className="start-wrap">
                <button
                  type="button"
                  className={`start-btn${pressed ? ' is-pressed' : ''}`}
                  onClick={startTransition}
                >
                  <span className="start-label">START</span>
                  <span className="start-sub">ENTER MY ROOM</span>
                </button>
              </div>
            </div>
          </section>
          </div>
        </div>
      ) : null}
      {phase !== 'opening' ? <TimeTravel /> : null}
    </>
  )
}
