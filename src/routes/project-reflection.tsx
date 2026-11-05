import { createFileRoute } from '@tanstack/react-router'
import { BlankSection } from '../components/BlankSection'

export const Route = createFileRoute('/project-reflection')({
  component: ProjectReflectionPage,
})

function ProjectReflectionPage() {
  return <BlankSection title="PROJECT REFLECTION" />
}
