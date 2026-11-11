import { createFileRoute } from '@tanstack/react-router'
import { WeeklyBlogEntry } from '../../components/WeeklyBlogEntry'

export const Route = createFileRoute('/weekly-blog/')({
  component: WeeklyBlogIndex,
})

function WeeklyBlogIndex() {
  return <WeeklyBlogEntry week={1} />
}
