import { createFileRoute } from '@tanstack/react-router'
import { ChapterPage } from '../components/ChapterPage'

export const Route = createFileRoute('/chapter-5')({
  component: ChapterFivePage,
})

function ChapterFivePage() {
  return <ChapterPage title="CHAPTER 5" src="/images/chapters/chapter-5.svg" height={13449.75} />
}
