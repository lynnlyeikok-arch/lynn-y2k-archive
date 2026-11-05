import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'

export const Route = createFileRoute('/case-study-2')({
  component: CaseStudyTwoPage,
})

function CaseStudyTwoPage() {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-case-study')
    body.classList.add('is-case-study')
    window.scrollTo(0, 0)
    html.scrollTop = 0
    body.scrollTop = 0
    return () => {
      html.classList.remove('is-case-study', 'is-case-study-full')
      body.classList.remove('is-case-study', 'is-case-study-full')
    }
  }, [])

  return (
    <main className="case-study-page case-study-punyus">
      <IntroHeader />
      <h1 className="case-study-title">CASE STUDY 2 — PUNYUS</h1>
      <img
        className="case-study-plate"
        src="/images/case-study/punyus.svg"
        alt="Punyus case study"
        width={1024.5}
        height={6408}
        draggable={false}
      />
    </main>
  )
}
