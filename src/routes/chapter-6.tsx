import { createFileRoute } from '@tanstack/react-router'
import { ChapterPage } from '../components/ChapterPage'

export const Route = createFileRoute('/chapter-6')({
  component: ChapterSixPage,
})

function ChapterSixPage() {
  return <ChapterPage title="CHAPTER 6" src="/images/chapters/chapter-6.svg" height={12017.25} />
}
