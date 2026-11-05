import { Link } from '@tanstack/react-router'

export function BlankSection({
  title,
  onBack,
  backLabel = 'HOME',
}: {
  title: string
  onBack?: () => void
  backLabel?: string
}) {
  return (
    <main className="blank-section">
      <p className="blank-section-back">
        {onBack ? (
          <button type="button" onClick={onBack}>
            {backLabel}
          </button>
        ) : (
          <Link to="/intro" hash="intro">
            HOME
          </Link>
        )}
      </p>
      <h1>{title}</h1>
    </main>
  )
}
