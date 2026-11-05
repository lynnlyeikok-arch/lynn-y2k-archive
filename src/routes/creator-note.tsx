import { createFileRoute } from '@tanstack/react-router'
import { BlankSection } from '../components/BlankSection'
import { useReturnFromPopup } from '../components/popupReturn'

export const Route = createFileRoute('/creator-note')({
  component: CreatorNotePage,
})

function CreatorNotePage() {
  const { fromHere, goBack } = useReturnFromPopup('id-card')
  if (fromHere) {
    return <BlankSection title="A NOTE FROM THE CREATOR" onBack={goBack} backLabel="BACK" />
  }
  return <BlankSection title="A NOTE FROM THE CREATOR" />
}
