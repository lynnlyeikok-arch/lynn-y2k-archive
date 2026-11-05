import { createFileRoute } from '@tanstack/react-router'
import { ChapterPage } from '../components/ChapterPage'

export const Route = createFileRoute('/chapter-8')({
  component: ChapterEightPage,
})

function ChapterEightPage() {
  return <ChapterPage title="CHAPTER 8" src="/images/chapters/chapter-8.svg" height={7767.75} />
}
