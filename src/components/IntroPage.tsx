import { useLayoutEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AboutMenu } from './AboutMenu'
import { IntroHeader } from './IntroHeader'
import {
  CaseStudiesMenu,
  PrimaryResearchMenu,
  SecondaryResearchMenu,
} from './ResearchMenus'

export function IntroPage() {
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('is-intro')
    body.classList.add('is-intro')
    html.style.overflow = ''
    const hash = window.location.hash.replace('#', '')
    if (hash === 'moodboards') {
      void navigate({ to: '/moodboards', replace: true })
      return
    }
    if (!hash || hash === 'intro') {
      window.scrollTo(0, 0)
      html.scrollTop = 0
      body.scrollTop = 0
    } else {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }

    return () => {
      html.classList.remove('is-intro')
      body.classList.remove('is-intro')
    }
  }, [navigate])

  return (
    <main className="intro-page" id="intro">
      <IntroHeader />

      <div className="intro-visual">
        <img
          className="intro-svg"
          src="/images/intro-3.svg"
          alt="One size does not fit all"
          width={1024.5}
          height={1335.75}
          draggable={false}
        />
        <Link
          to="/moodboards"
          className="intro-moodboard-hotspot"
          aria-label="MOODBOARDS"
        />
        <PrimaryResearchMenu />
        <SecondaryResearchMenu />
        <CaseStudiesMenu />
        <AboutMenu />
      </div>

      <div className="intro-anchor" id="primary-research" />
      <div className="intro-anchor" id="secondary-research" />
      <div className="intro-anchor" id="case-studies" />
      <div className="intro-anchor" id="about" />
    </main>
  )
}
