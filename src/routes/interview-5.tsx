import { createFileRoute } from '@tanstack/react-router'
import { ResearchPlate } from '../components/ResearchPlate'

export const Route = createFileRoute('/interview-5')({
  component: InterviewFivePage,
})

function InterviewFivePage() {
  return <ResearchPlate title="INTERVIEW 5" src="/images/primary/interview-5.svg" height={3744.75} />
}
