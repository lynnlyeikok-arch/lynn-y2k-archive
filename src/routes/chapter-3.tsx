import { createFileRoute } from '@tanstack/react-router'
import { ChapterPage } from '../components/ChapterPage'

export const Route = createFileRoute('/chapter-3')({
  component: ChapterThreePage,
})

function ChapterThreePage() {
  return <ChapterPage title="CHAPTER 3" src="/images/chapters/chapter-3.svg" height={8499.75} />
}
