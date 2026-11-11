'use client'

import { Download, Home, Search, Settings, Trophy } from 'lucide-react'
import { LogoMark, Wordmark } from './Logo'

export type Tab = 'home' | 'football' | 'downloads' | 'settings' | 'search'

const items: { id: Exclude<Tab, 'search'>; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'football', label: 'Football', Icon: Trophy },
  { id: 'downloads', label: 'Downloads', Icon: Download },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

export function TopBar({ tab, onTab, scrolled, badge }: { tab: Tab; onTab: (t: Tab) => void; scrolled: boolean; badge: number }) {
  return (
    <header className={scrolled ? 'topbar topbar-solid' : 'topbar'}>
      <button className="brand" onClick={() => onTab('home')} aria-label="CymorFlix home">
        <LogoMark size={32} />
        <Wordmark />
      </button>
      <nav className="desktop-links" aria-label="Primary">
        {items.map(({ id, label }) => (
          <button key={id} className={tab === id ? 'nav-active' : ''} onClick={() => onTab(id)}>
            {label}{id === 'downloads' && badge > 0 ? <em>{badge}</em> : null}
          </button>
        ))}
      </nav>
      <button className={tab === 'search' ? 'icon-btn icon-btn-on' : 'icon-btn'} aria-label="Search" onClick={() => onTab('search')}>
        <Search size={20} />
      </button>
    </header>
  )
}

export function BottomNav({ tab, onTab, badge }: { tab: Tab; onTab: (t: Tab) => void; badge: number }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map(({ id, label, Icon }) => (
        <button key={id} className={tab === id ? 'bottom-active' : ''} onClick={() => onTab(id)} aria-current={tab === id ? 'page' : undefined}>
          <span className="bn-icon">
            <Icon size={21} />
            {id === 'downloads' && badge > 0 ? <em>{badge}</em> : null}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
