import { Link } from 'react-router-dom'
import { ArrowUpRight, Menu } from 'lucide-react'
import { BrandMark } from './BrandMark'

const links = [{ label: 'How it works', href: '#workflow' }, { label: 'Why Trace2PR', href: '#features' }, { label: 'Integrations', href: '#integrations' }]

export function LandingHeader() {
  return <header className="site-header"><div className="page-shell site-header__inner">
    <BrandMark />
    <nav className="site-nav" aria-label="Primary navigation">{links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
    <div className="site-header__actions">
      <Link to="/login" className="text-link">Sign in</Link>
      <Link to="/login" className="button button--small">Get started <ArrowUpRight size={15} aria-hidden="true" /></Link>
      <button className="menu-button" type="button" aria-label="Open navigation menu"><Menu size={21} aria-hidden="true" /></button>
    </div>
  </div></header>
}