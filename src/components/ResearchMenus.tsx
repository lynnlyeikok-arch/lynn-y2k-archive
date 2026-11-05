import { useState, type FocusEvent, type MouseEvent } from 'react'
import { Link } from '@tanstack/react-router'

const INTERVIEWS = [
  { to: '/interview-1', label: 'INTERVIEW 1' },
  { to: '/interview-2', label: 'INTERVIEW 2' },
  { to: '/interview-3', label: 'INTERVIEW 3' },
  { to: '/interview-4', label: 'INTERVIEW 4' },
  { to: '/interview-5', label: 'INTERVIEW 5' },
] as const

const CHAPTERS = [
  { to: '/chapter-1', label: 'CHAPTER 1' },
  { to: '/chapter-2', label: 'CHAPTER 2' },
  { to: '/chapter-3', label: 'CHAPTER 3' },
  { to: '/chapter-4', label: 'CHAPTER 4' },
  { to: '/chapter-5', label: 'CHAPTER 5' },
  { to: '/chapter-6', label: 'CHAPTER 6' },
  { to: '/chapter-7', label: 'CHAPTER 7' },
  { to: '/chapter-8', label: 'CHAPTER 8' },
] as const

const CASE_STUDIES = [
  { to: '/case-study-1', label: 'CASE STUDY 1 — LA FARFA MAGAZINE' },
  { to: '/case-study-2', label: 'CASE STUDY 2 — PUNYUS' },
  { to: '/case-study-3', label: 'CASE STUDY 3 — TWO L MALAYSIA' },
] as const

function canHoverMenu() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function joinClass(base: string, open: boolean, className: string) {
  return `${base}${open ? ' is-open' : ''}${className ? ` ${className}` : ''}`
}

function labelClick(event: MouseEvent<HTMLButtonElement>, toggle: () => void) {
  event.preventDefault()
  if (!canHoverMenu() || event.detail === 0) toggle()
}

function labelFocus(event: FocusEvent<HTMLButtonElement>, open: () => void) {
  if (event.currentTarget.matches(':focus-visible')) open()
}

export function PrimaryResearchMenu({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [interviewOpen, setInterviewOpen] = useState(false)

  const close = () => {
    setOpen(false)
    setInterviewOpen(false)
  }

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) close()
  }

  return (
    <div
      className={joinClass('intro-research', open, className)}
      onMouseEnter={() => {
        if (canHoverMenu()) setOpen(true)
      }}
      onMouseLeave={close}
      onBlur={onBlur}
    >
      <button
        type="button"
        className="intro-about-hit"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="PRIMARY RESEARCH"
        onClick={(event) =>
          labelClick(event, () =>
            setOpen((current) => {
              if (current) setInterviewOpen(false)
              return !current
            }),
          )
        }
        onFocus={(event) => labelFocus(event, () => setOpen(true))}
      />
      <ul className="intro-about-menu intro-research-menu">
        <li>
          <Link to="/survey-form-result">SURVEY FORM RESULT</Link>
        </li>
        <li
          className={`intro-interview${interviewOpen ? ' is-open' : ''}`}
          onMouseEnter={() => {
            if (canHoverMenu()) setInterviewOpen(true)
          }}
          onMouseLeave={() => setInterviewOpen(false)}
        >
          <button
            type="button"
            className="intro-interview-trigger"
            aria-expanded={interviewOpen}
            onClick={(event) =>
              labelClick(event, () => setInterviewOpen((current) => !current))
            }
            onFocus={(event) => labelFocus(event, () => setInterviewOpen(true))}
          >
            INTERVIEW
          </button>
          <div className="intro-interview-menu">
            <ul>
              {INTERVIEWS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </li>
      </ul>
    </div>
  )
}

export function SecondaryResearchMenu({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={joinClass('intro-secondary', open, className)}
      onMouseEnter={() => {
        if (canHoverMenu()) setOpen(true)
      }}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        type="button"
        className="intro-about-hit"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="SECONDARY RESEARCH"
        onClick={(event) => labelClick(event, () => setOpen((current) => !current))}
        onFocus={(event) => labelFocus(event, () => setOpen(true))}
      />
      <ul className="intro-about-menu intro-secondary-menu">
        {CHAPTERS.map((item) => (
          <li key={item.to}>
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CaseStudiesMenu({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={joinClass('intro-cases', open, className)}
      onMouseEnter={() => {
        if (canHoverMenu()) setOpen(true)
      }}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        type="button"
        className="intro-about-hit"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="CASE STUDIES"
        onClick={(event) => labelClick(event, () => setOpen((current) => !current))}
        onFocus={(event) => labelFocus(event, () => setOpen(true))}
      />
      <ul className="intro-about-menu intro-cases-menu">
        {CASE_STUDIES.map((item) => (
          <li key={item.to}>
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
