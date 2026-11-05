import { createFileRoute } from '@tanstack/react-router'
import { BlankSection } from '../components/BlankSection'

export const Route = createFileRoute('/instagram-account')({
  component: InstagramAccountPage,
})

function InstagramAccountPage() {
  return <BlankSection title="INSTAGRAM ACCOUNT" />
}
