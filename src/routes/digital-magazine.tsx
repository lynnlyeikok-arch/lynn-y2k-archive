import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'
import { MoodboardBook } from '../components/MoodboardBook'
import { useReturnFromPopup } from '../components/popupReturn'
import {
  MAGAZINE_PAGE_HEIGHT,
  MAGAZINE_PAGE_WIDTH,
  MAGAZINE_PAGES,
} from '../utils/magazinePages'

export const Route = createFileRoute('/digital-magazine')({
  component: DigitalMagazinePage,
})

function DigitalMagazinePage() {
  const { fromHere, goBack } = useReturnFromPopup('magazine')

  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-digital-magazine')
    body.classList.add('is-digital-magazine')
    window.scrollTo(0, 0)
    html.scrollTop = 0
    body.scrollTop = 0
    return () => {
      html.classList.remove('is-digital-magazine')
      body.classList.remove('is-digital-magazine')
    }
  }, [])

  return (
    <main className="digital-magazine-page" aria-label="Digital magazine">
      <IntroHeader />
      <div className="moodboards-bg" aria-hidden="true">
        <div className="opening-canvas" />
      </div>
      {fromHere ? (
        <button type="button" className="digital-magazine-back" onClick={goBack}>
          BACK
        </button>
      ) : null}
      <MoodboardBook
        pages={MAGAZINE_PAGES}
        pageWidth={MAGAZINE_PAGE_WIDTH}
        pageHeight={MAGAZINE_PAGE_HEIGHT}
        minPageWidth={80}
        maxPageWidth={1600}
        minPageHeight={113}
        maxPageHeight={2262}
        portraitBreakpoint={null}
        fullscreenSelector=".digital-magazine-page"
        loadingLabel="Loading magazine"
        controlsLabel="Digital magazine controls"
      />
    </main>
  )
}
