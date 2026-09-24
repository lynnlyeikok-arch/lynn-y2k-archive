import { createFileRoute } from '@tanstack/react-router'
import { IntroPage } from '../components/IntroPage'

export const Route = createFileRoute('/intro')({
  component: IntroPage,
})
