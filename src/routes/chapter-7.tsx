import { createFileRoute } from '@tanstack/react-router'
import { ChapterPage } from '../components/ChapterPage'

export const Route = createFileRoute('/chapter-7')({
  component: ChapterSevenPage,
})

function ChapterSevenPage() {
  return <ChapterPage title="CHAPTER 7" src="/images/chapters/chapter-7.svg" height={9370.5} />
}
