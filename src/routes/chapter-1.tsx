import { createFileRoute } from '@tanstack/react-router'
import { ChapterPage } from '../components/ChapterPage'

export const Route = createFileRoute('/chapter-1')({
  component: ChapterOnePage,
})

function ChapterOnePage() {
  return <ChapterPage title="CHAPTER 1" src="/images/chapters/chapter-1.svg" height={8035.5} />
}
