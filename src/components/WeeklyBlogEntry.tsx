import { useLayoutEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { IntroHeader } from './IntroHeader'

const WEEKS = [
  { file: 'week-01', width: 1024.5, height: 1178.25, visible: 1076, label: 'Week 01, 17 August to 23 August' },
  { file: 'week-02', width: 1024.5, height: 1077.75, visible: 1002, label: 'Week 02, 24 August to 30 August' },
  { file: 'week-03', width: 1024.5, height: 1264.5, visible: 1158, label: 'Week 03, 31 August to 6 September' },
  { file: 'week-04', width: 1024.5, height: 1489.5, visible: 1413, label: 'Week 04, 7 September to 13 September' },
  { file: 'week-05', width: 1024.5, height: 1668, visible: 1613, label: 'Week 05, 14 September to 20 September' },
  { file: 'week-06', width: 1024.5, height: 1510.5, visible: 1148, label: 'Week 06, 21 September to 27 September' },
  { file: 'week-07', width: 1024.5, height: 1597.5, visible: 1496, label: 'Week 07, 28 September to 4 October' },
  { file: 'week-08', width: 1024.5, height: 2412.75, visible: 2179, label: 'Week 08, 5 October to 11 October' },
  { file: 'week-09', width: 1024.5, height: 2968.5, visible: 2530, label: 'Week 09, 12 October to 18 October' },
  { file: 'week-10', width: 1024.5, height: 3996.75, visible: 3104, label: 'Week 10, 19 October to 25 October' },
  { file: 'week-11', width: 1024.5, height: 3996.75, visible: 1622, label: 'Week 11, 26 October to 1 November' },
  { file: 'week-12', width: 1024.5, height: 3996.75, visible: 1871, label: 'Week 12, 2 November to 8 November' },
  { label: 'Week 13' },
  { label: 'Week 14' },
] as const

export const weeklyBlogWeekCount = WEEKS.length

export function WeeklyBlogEntry({ week }: { week: number }) {
  const entry = WEEKS[week - 1]
  const isLast = week === WEEKS.length
  const next = String(week + 1)

  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-weekly-blog')
    body.classList.add('is-weekly-blog')
    html.classList.toggle('is-week-02', week === 2)
    body.classList.toggle('is-week-02', week === 2)
    window.scrollTo(0, 0)
    return () => {
      html.classList.remove('is-weekly-blog', 'is-week-02')
      body.classList.remove('is-weekly-blog', 'is-week-02')
    }
  }, [week])

  return (
    <main className="weekly-blog-page">
      <IntroHeader />
      <div className="moodboards-bg" aria-hidden="true">
        <div className="opening-canvas" />
      </div>
      <h1 className="weekly-blog-title">{entry.label}</h1>
      {'file' in entry ? (
        <div className="weekly-art-frame" style={{ ['--visible' as string]: entry.visible }}>
          <img
            className="weekly-blog-art"
            src={`/images/weekly-blog/${entry.file}.svg`}
            alt={entry.label}
            width={entry.width}
            height={entry.height}
            draggable={false}
          />
        </div>
      ) : null}
      <div className={isLast ? 'weekly-footer is-back-only' : 'weekly-footer'}>
        <div className="weekly-footer-frame">
          <img
            src={
              week === 1
                ? '/images/weekly-blog/footer-next.svg'
                : '/images/weekly-blog/footer-week-01.svg'
            }
            alt=""
            width={1024.5}
            height={576}
            draggable={false}
          />
          {week === 2 ? (
            <>
              <Link
                to="/weekly-blog"
                resetScroll
                className="weekly-footer-hit is-prev"
                aria-label="Go to Week 01."
              />
              <Link
                to="/weekly-blog/$week"
                params={{ week: '3' }}
                resetScroll
                className="weekly-footer-hit is-next"
                aria-label="Go to Week 03."
              />
            </>
          ) : week >= 3 ? (
            <>
              <Link
                to="/weekly-blog/$week"
                params={{ week: String(week - 1) }}
                resetScroll
                className={isLast ? 'weekly-footer-hit' : 'weekly-footer-hit is-prev'}
                aria-label={`Go to Week ${String(week - 1).padStart(2, '0')}.`}
              />
              {week < WEEKS.length ? (
                <Link
                  to="/weekly-blog/$week"
                  params={{ week: next }}
                  resetScroll
                  className="weekly-footer-hit is-next"
                  aria-label={`Go to Week ${next.padStart(2, '0')}.`}
                />
              ) : null}
            </>
          ) : (
            <Link
              to="/weekly-blog/$week"
              params={{ week: next }}
              resetScroll
              className="weekly-footer-hit is-play"
              aria-label="Go to Week 02."
            />
          )}
        </div>
      </div>
    </main>
  )
}
