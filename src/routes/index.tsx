import { createFileRoute } from '@tanstack/react-router'
import { OpeningScreen } from '../components/OpeningScreen'

export const Route = createFileRoute('/')({
  component: OpeningScreen,
})
