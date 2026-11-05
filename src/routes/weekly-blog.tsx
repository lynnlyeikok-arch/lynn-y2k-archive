import { createFileRoute } from '@tanstack/react-router'
import { BlankSection } from '../components/BlankSection'
import { useReturnFromPopup } from '../components/popupReturn'

export const Route = createFileRoute('/weekly-blog')({
  component: WeeklyBlogPage,
})

function WeeklyBlogPage() {
  const { goBack } = useReturnFromPopup('calendar')
  return <BlankSection title="WEEKLY BLOG" onBack={goBack} backLabel="BACK" />
}
