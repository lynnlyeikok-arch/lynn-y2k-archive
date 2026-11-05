import { createFileRoute } from '@tanstack/react-router'
import { ResearchPlate } from '../components/ResearchPlate'

export const Route = createFileRoute('/interview-3')({
  component: InterviewThreePage,
})

function InterviewThreePage() {
  return <ResearchPlate title="INTERVIEW 3" src="/images/primary/interview-3.svg" height={3744.75} />
}
