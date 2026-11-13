import { useLayoutEffect } from 'react'
import { IntroHeader } from './IntroHeader'

function fitSurveyDocument(object: HTMLObjectElement) {
  const svg = object.contentDocument?.documentElement
  if (!svg || svg.tagName.toLowerCase() !== 'svg') return
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.style.display = 'block'
}

export function ResearchPlate({
  title,
  src,
  height,
  documentMode = false,
}: {
  title: string
  src: string
  height: number
  documentMode?: boolean
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
      {documentMode ? (
        <object
          className="primary-plate survey-plate"
          type="image/svg+xml"
          data={src}
          aria-label={title}
          style={{ aspectRatio: `1024.5 / ${height}` }}
          onLoad={(event) => fitSurveyDocument(event.currentTarget)}
        />
      ) : (
        <img
          className="primary-plate"
          src={src}
          alt={title}
          width={1024.5}
          height={height}
          draggable={false}
        />
      )}
    </main>
  )
}
