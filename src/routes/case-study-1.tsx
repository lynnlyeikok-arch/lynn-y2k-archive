import { useLayoutEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'

export const Route = createFileRoute('/case-study-1')({
  component: CaseStudyOnePage,
})

function CaseStudyOnePage() {
  const [fullSize, setFullSize] = useState(false)

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

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('is-case-study-full', fullSize)
    document.body.classList.toggle('is-case-study-full', fullSize)
  }, [fullSize])

  return (
    <main className="case-study-page">
      <IntroHeader />
      <article className="case-study-scroll">
        <h1 className="case-study-title">CASE STUDY 1 — LA FARFA MAGAZINE</h1>
        <img
          className="case-study-plate"
          src="/images/case-study/la-farfa-1.svg"
          alt="La Farfa magazine cover"
          width={1024.5}
          height={576}
          draggable={false}
        />
        <img
          className="case-study-plate"
          src="/images/case-study/la-farfa-2.svg"
          alt="La Farfa magazine case study"
          width={1024.5}
          height={7017}
          draggable={false}
        />
      </article>
      <button
        type="button"
        className="case-study-zoom"
        onClick={() => setFullSize((current) => !current)}
      >
        {fullSize ? 'FIT WIDTH' : 'FULL SIZE'}
      </button>
    </main>
  )
}
