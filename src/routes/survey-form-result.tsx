import { createFileRoute } from '@tanstack/react-router'
import { ResearchPlate } from '../components/ResearchPlate'

export const Route = createFileRoute('/survey-form-result')({
  component: SurveyFormResultPage,
})

function SurveyFormResultPage() {
  return (
    <ResearchPlate
      title="SURVEY FORM RESULT"
      src="/images/primary/survey-form-result.svg"
      height={9533.25}
    />
  )
}
