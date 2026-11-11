import { Navigate, createFileRoute } from '@tanstack/react-router'
import { WeeklyBlogEntry, weeklyBlogWeekCount } from '../../components/WeeklyBlogEntry'

export const Route = createFileRoute('/weekly-blog/$week')({
  component: WeeklyBlogWeek,
})

function WeeklyBlogWeek() {
  const { week } = Route.useParams()
  const number = Number(week)
  if (!Number.isInteger(number) || number < 2 || number > weeklyBlogWeekCount) {
    return <Navigate to="/weekly-blog" replace />
  }
  return <WeeklyBlogEntry week={number} />
}
