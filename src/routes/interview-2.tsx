import { createFileRoute } from '@tanstack/react-router'
import { ResearchPlate } from '../components/ResearchPlate'

export const Route = createFileRoute('/interview-2')({
  component: InterviewTwoPage,
})

function InterviewTwoPage() {
  return <ResearchPlate title="INTERVIEW 2" src="/images/primary/interview-2.svg" height={3889.5} />
}
