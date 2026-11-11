import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'

export const Route = createFileRoute('/instagram-account')({
  component: InstagramAccountPage,
})

function InstagramAccountPage() {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-instagram')
    body.classList.add('is-instagram')
    window.scrollTo(0, 0)
    return () => {
      html.classList.remove('is-instagram')
      body.classList.remove('is-instagram')
    }
  }, [])

  return (
    <main className="instagram-page">
      <IntroHeader />
      <h1 className="instagram-title">INSTAGRAM ACCOUNT</h1>
      <img
        className="instagram-plate"
        src="/images/instagram-account.svg"
        alt="Let's connect. Follow the archive at @SIZE.404."
        width={1024.5}
        height={576}
        draggable={false}
      />
    </main>
  )
}
