import { useState, type FocusEvent, type MouseEvent } from 'react'
import { Link } from '@tanstack/react-router'

const ABOUT_ITEMS = [
  { to: '/personal-information', label: 'PERSONAL INFORMATION' },
  { to: '/digital-magazine', label: 'DIGITAL MAGAZINE' },
  { to: '/project-reflection', label: 'PROJECT REFLECTION' },
  { to: '/references', label: 'REFERENCES' },
  { to: '/instagram-account', label: 'INSTAGRAM ACCOUNT' },
  { to: '/weekly-blog', label: 'WEEKLY BLOG' },
] as const

function canHoverAbout() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function AboutMenu({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!canHoverAbout() || event.detail === 0) {
      setOpen((current) => !current)
    }
  }

  const onFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(':focus-visible')) {
      setOpen(true)
    }
  }

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false)
    }
  }

  return (
    <div
      className={`intro-about${open ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
      onMouseEnter={() => {
        if (canHoverAbout()) setOpen(true)
      }}
      onMouseLeave={() => setOpen(false)}
      onBlur={onBlur}
    >
      <button
        type="button"
        className="intro-about-hit"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="ABOUT"
        onClick={onClick}
        onFocus={onFocus}
      />
      <ul className="intro-about-menu">
        {ABOUT_ITEMS.map((item) => (
          <li key={item.to}>
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
