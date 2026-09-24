import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/continue')({
  component: ContinuePlaceholder,
})

function ContinuePlaceholder() {
  return (
    <main className="continue-placeholder">
      <p>NEXT SECTION — PLACEHOLDER</p>
      <p>
        This destination after ENTER is not designed yet. The selected outfit and size stay saved in
        this browser tab.
      </p>
    </main>
  )
}
