import { useLayoutEffect } from 'react'
import { IntroHeader } from './IntroHeader'

export function ChapterPage({
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
    html.classList.add('is-chapter')
    body.classList.add('is-chapter')
    window.scrollTo(0, 0)
    html.scrollTop = 0
    body.scrollTop = 0
    return () => {
      html.classList.remove('is-chapter')
      body.classList.remove('is-chapter')
    }
  }, [])

  return (
    <main className="chapter-page">
      <IntroHeader />
      <h1 className="chapter-title">{title}</h1>
      <img
        className="chapter-plate"
        src={src}
        alt={title}
        width={1024.5}
        height={height}
        draggable={false}
      />
    </main>
  )
}
