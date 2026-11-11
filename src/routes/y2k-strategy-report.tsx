import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'

const REPORT_SRC = '/images/primary/strategy-report-1.svg'

export const Route = createFileRoute('/y2k-strategy-report')({
  component: Y2kStrategyReportPage,
})

function scrollToReport() {
  const report = document.getElementById('strategy-report-content')
  const header = document.querySelector<HTMLElement>('.intro-header')
  if (!report) return
  const headerHeight = header ? Math.max(header.getBoundingClientRect().height - 3, 0) : 0
  const top = report.getBoundingClientRect().top + window.scrollY - headerHeight
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  window.scrollTo({ top, behavior })
}

function Y2kStrategyReportPage() {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-strategy-report')
    body.classList.add('is-strategy-report')
    window.scrollTo(0, 0)
    html.scrollTop = 0
    body.scrollTop = 0
    return () => {
      html.classList.remove('is-strategy-report')
      body.classList.remove('is-strategy-report')
    }
  }, [])

  return (
    <main className="strategy-report-page">
      <IntroHeader />
      <h1 className="primary-title">Y2K STRATEGY REPORT</h1>
      <section className="strategy-report-cover" aria-label="Y2K strategy report cover">
        <img src={REPORT_SRC} alt="" width={1024.5} height={6447.75} draggable={false} />
        <button type="button" className="strategy-report-arrow" aria-label="Scroll to report" onClick={scrollToReport}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 9l7 7 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </section>
      <section id="strategy-report-content" className="strategy-report-content">
        <img
          src={REPORT_SRC}
          alt="Y2K strategy report"
          width={1024.5}
          height={6447.75}
          draggable={false}
        />
      </section>
    </main>
  )
}
