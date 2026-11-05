import { type CSSProperties, type MouseEvent } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { AboutMenu } from './AboutMenu'
import {
  CaseStudiesMenu,
  PrimaryResearchMenu,
  SecondaryResearchMenu,
} from './ResearchMenus'

const VIEWBOX_WIDTH = 1024.5
const BAR_Y = 269
const BAR_H = 58
const PAD_X = 2
const PAD_Y = 3

function box(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
): CSSProperties {
  return {
    left: `${((minX - PAD_X) / VIEWBOX_WIDTH) * 100}%`,
    top: `${((minY - PAD_Y - BAR_Y) / BAR_H) * 100}%`,
    width: `${((maxX - minX + PAD_X * 2) / VIEWBOX_WIDTH) * 100}%`,
    height: `${((maxY - minY + PAD_Y * 2) / BAR_H) * 100}%`,
  }
}

const NAV = [
  { id: 'intro', label: 'HOME', style: box(96.65, 137.56, 299.97, 309.6) },
  {
    id: 'primary-research',
    label: 'PRIMARY RESEARCH',
    style: box(185.0, 327.63, 299.97, 309.6),
  },
  {
    id: 'secondary-research',
    label: 'SECONDARY RESEARCH',
    style: box(375.13, 540.34, 299.97, 309.6),
  },
  {
    id: 'case-studies',
    label: 'CASE STUDIES',
    style: box(587.91, 687.68, 299.97, 309.6),
  },
  {
    id: 'moodboards',
    label: 'MOODBOARDS',
    style: box(735.14, 835.8, 299.97, 309.6),
  },
  { id: 'about', label: 'ABOUT', style: box(882.48, 930.28, 299.97, 309.6) },
] as const

export function IntroHeader() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const onHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/intro') return
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'auto' })
    void navigate({ to: '/intro', hash: 'intro', replace: true, resetScroll: true })
  }

  return (
    <>
    <header className="intro-header">
      <img
        className="intro-header-svg"
        src="/images/intro/header.svg"
        alt=""
        draggable={false}
      />
      <nav className="intro-header-nav" aria-label="Site">
        {NAV.map((item) =>
          item.id === 'about' ||
          item.id === 'primary-research' ||
          item.id === 'secondary-research' ||
          item.id === 'case-studies' ? null : item.id === 'moodboards' ? (
            <Link
              key={item.id}
              to="/moodboards"
              aria-label={item.label}
              style={item.style}
            />
          ) : (
            <Link
              key={item.id}
              to="/intro"
              hash={item.id}
              aria-label={item.label}
              style={item.style}
              resetScroll={item.id === 'intro'}
              hashScrollIntoView={item.id !== 'intro'}
              onClick={item.id === 'intro' ? onHomeClick : undefined}
            />
          ),
        )}
      </nav>
    </header>
    {pathname === '/intro' ? null : (
      <>
        <PrimaryResearchMenu className="intro-header-research" />
        <SecondaryResearchMenu className="intro-header-secondary" />
        <CaseStudiesMenu className="intro-header-cases" />
        <AboutMenu className="intro-header-about" />
      </>
    )}
    </>
  )
}
