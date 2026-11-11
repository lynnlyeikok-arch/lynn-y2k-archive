import { useLayoutEffect } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/creator-note')({
  component: CreatorNotePage,
})

function CreatorNotePage() {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-creator-note')
    body.classList.add('is-creator-note')
    window.scrollTo(0, 0)
    return () => {
      html.classList.remove('is-creator-note')
      body.classList.remove('is-creator-note')
    }
  }, [])

  return (
    <main className="creator-note-page">
      <div className="moodboards-bg" aria-hidden="true">
        <div className="opening-canvas" />
      </div>
      <Link to="/personal-information" className="creator-note-back">
        BACK
      </Link>
      <img
        className="creator-note-art"
        src="/images/cork-parts/creator-note.svg"
        alt="A note from Lynn Lyei about One Size Does Not Fit All."
        width={1099.5}
        height={823.5}
        draggable={false}
      />
    </main>
  )
}
