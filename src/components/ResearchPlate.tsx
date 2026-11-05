import { useLayoutEffect } from 'react'
import { IntroHeader } from './IntroHeader'

export function ResearchPlate({
  title,
  src,
  height,
}: {
  title: string
  src: string
  height: number
}) {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-primary')
    body.classList.add('is-primary')
    window.scrollTo(0, 0)
    html.scrollTop = 0
    body.scrollTop = 0
    return () => {
      html.classList.remove('is-primary')
      body.classList.remove('is-primary')
    }
  }, [])

  return (
    <main className="primary-page">
      <IntroHeader />
      <h1 className="primary-title">{title}</h1>
      <img
        className="primary-plate"
        src={src}
        alt={title}
        width={1024.5}
        height={height}
        draggable={false}
      />
    </main>
  )
}
