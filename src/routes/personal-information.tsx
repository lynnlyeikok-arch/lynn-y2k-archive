import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'
import { PersonalCorkboard } from '../components/PersonalCorkboard'
import { usePopupHistory } from '../components/popupReturn'

export const Route = createFileRoute('/personal-information')({
  component: PersonalInformationPage,
})

function PersonalInformationPage() {
  const { reopen, scrollY } = usePopupHistory()

  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-personal')
    body.classList.add('is-personal')
    window.scrollTo(0, scrollY ?? 0)
    return () => {
      html.classList.remove('is-personal')
      body.classList.remove('is-personal')
    }
  }, [scrollY])

  return (
    <main className="personal-page">
      <IntroHeader />
      <div className="moodboards-bg" aria-hidden="true">
        <div className="opening-canvas" />
      </div>
      <div className="personal-stage">
        <PersonalCorkboard initialOpen={reopen ?? null} />
      </div>
    </main>
  )
}
