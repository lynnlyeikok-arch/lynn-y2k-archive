import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'

export const Route = createFileRoute('/case-study-3')({
  component: CaseStudyThreePage,
})

function CaseStudyThreePage() {
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
    <main className="case-study-page case-study-two-l">
      <IntroHeader />
      <h1 className="case-study-title">CASE STUDY 3 — TWO L MALAYSIA</h1>
      <img
        className="case-study-plate"
        src="/images/case-study/two-l.svg"
        alt="Two L Malaysia case study"
        width={1024.5}
        height={4875}
        draggable={false}
      />
    </main>
  )
}
