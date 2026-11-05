import { createFileRoute } from '@tanstack/react-router'
import { ResearchPlate } from '../components/ResearchPlate'

export const Route = createFileRoute('/interview-1')({
  component: InterviewOnePage,
})

function InterviewOnePage() {
  return <ResearchPlate title="INTERVIEW 1" src="/images/primary/interview-1.svg" height={4524.75} />
}
