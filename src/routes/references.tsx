import { createFileRoute } from '@tanstack/react-router'
import { BlankSection } from '../components/BlankSection'

export const Route = createFileRoute('/references')({
  component: ReferencesPage,
})

function ReferencesPage() {
  return <BlankSection title="REFERENCES" />
}
