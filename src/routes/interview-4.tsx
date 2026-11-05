import { createFileRoute } from '@tanstack/react-router'
import { ResearchPlate } from '../components/ResearchPlate'

export const Route = createFileRoute('/interview-4')({
  component: InterviewFourPage,
})

function InterviewFourPage() {
  return <ResearchPlate title="INTERVIEW 4" src="/images/primary/interview-4.svg" height={3744.75} />
}
