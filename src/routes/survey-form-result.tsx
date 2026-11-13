import { useLayoutEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ResearchPlate } from '../components/ResearchPlate'

const readSurveyPhone = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { getRequestHeader } = await import('@tanstack/react-start/server')
    const ua = getRequestHeader('user-agent') ?? ''
    return /iPhone|iPod|Android.+Mobile/i.test(ua)
  } catch {
    return false
  }
})

export const Route = createFileRoute('/survey-form-result')({
  loader: () => readSurveyPhone(),
  component: SurveyFormResultPage,
})

function SurveyFormResultPage() {
  const serverPhone = Route.useLoaderData()
  const [documentMode, setDocumentMode] = useState(serverPhone)

  useLayoutEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const apply = () => setDocumentMode(serverPhone || media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [serverPhone])

  return (
    <ResearchPlate
      title="SURVEY FORM RESULT"
      src="/images/primary/survey-form-result.svg"
      height={9533.25}
      documentMode={documentMode}
    />
  )
}
