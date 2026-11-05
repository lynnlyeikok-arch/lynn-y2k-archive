import { createFileRoute } from '@tanstack/react-router'
import { ChapterPage } from '../components/ChapterPage'

export const Route = createFileRoute('/chapter-4')({
  component: ChapterFourPage,
})

function ChapterFourPage() {
  return <ChapterPage title="CHAPTER 4" src="/images/chapters/chapter-4.svg" height={6028.5} />
}
