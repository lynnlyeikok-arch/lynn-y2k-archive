import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'

export const Route = createFileRoute('/project-reflection')({
  component: ProjectReflectionPage,
})

function ProjectReflectionPage() {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-project-reflection')
    body.classList.add('is-project-reflection')
    window.scrollTo(0, 0)
    return () => {
      html.classList.remove('is-project-reflection')
      body.classList.remove('is-project-reflection')
    }
  }, [])

  return (
    <main className="project-reflection-page">
      <IntroHeader />
      <div className="moodboards-bg" aria-hidden="true">
        <div className="opening-canvas" />
      </div>
      <img
        className="project-reflection-art"
        src="/images/cork-parts/project-reflection.svg?v=40"
        alt="My Reflection. One Size Does Not Fit All, by Kok Lynn Lyei."
        width={1111.5}
        height={1494}
        draggable={false}
      />
    </main>
  )
}
