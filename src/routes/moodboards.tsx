import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'
import { MoodboardBook } from '../components/MoodboardBook'

export const Route = createFileRoute('/moodboards')({
  component: MoodboardsPage,
})

function MoodboardsPage() {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-moodboards')
    body.classList.add('is-moodboards')
    window.scrollTo(0, 0)
    html.scrollTop = 0
    body.scrollTop = 0
    return () => {
      html.classList.remove('is-moodboards')
      body.classList.remove('is-moodboards')
    }
  }, [])

  return (
    <main className="moodboards-page" aria-label="Moodboards">
      <IntroHeader />
      <div className="moodboards-bg" aria-hidden="true">
        <div className="opening-canvas" />
      </div>
      <MoodboardBook />
    </main>
  )
}
