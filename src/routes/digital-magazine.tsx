import { createFileRoute } from '@tanstack/react-router'
import { BlankSection } from '../components/BlankSection'
import { useReturnFromPopup } from '../components/popupReturn'

export const Route = createFileRoute('/digital-magazine')({
  component: DigitalMagazinePage,
})

function DigitalMagazinePage() {
  const { fromHere, goBack } = useReturnFromPopup('magazine')
  if (fromHere) {
    return <BlankSection title="DIGITAL MAGAZINE" onBack={goBack} backLabel="BACK" />
  }
  return <BlankSection title="DIGITAL MAGAZINE" />
}
