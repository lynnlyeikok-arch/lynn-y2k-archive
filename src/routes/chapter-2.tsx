import { createFileRoute } from '@tanstack/react-router'
import { ChapterPage } from '../components/ChapterPage'

export const Route = createFileRoute('/chapter-2')({
  component: ChapterTwoPage,
})

function ChapterTwoPage() {
  return <ChapterPage title="CHAPTER 2" src="/images/chapters/chapter-2.svg" height={11430.75} />
}
