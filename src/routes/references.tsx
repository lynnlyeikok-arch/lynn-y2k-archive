import { useLayoutEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IntroHeader } from '../components/IntroHeader'
import { ReferencesPdf } from '../components/ReferencesPdf'

export const Route = createFileRoute('/references')({
  component: ReferencesPage,
})

function ReferencesPage() {
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-references')
    body.classList.add('is-references')
    window.scrollTo(0, 0)
    return () => {
      html.classList.remove('is-references')
      body.classList.remove('is-references')
      html.style.removeProperty('--references-pink')
    }
  }, [])

  return (
    <main className="references-page">
      <IntroHeader />
      <h1 className="references-title">References</h1>
      <ReferencesPdf />
    </main>
  )
}
