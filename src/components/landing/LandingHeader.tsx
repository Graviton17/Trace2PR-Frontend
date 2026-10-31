import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from './BrandMark';

const links = [
  { label: 'How it works', href: '#workflow' },
  { label: 'Why Trace2PR', href: '#features' },
  { label: 'Integrations', href: '#integrations' },
];

export function LandingHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cta = user ? (
    <Link to="/dashboard" className="button button--small">
      Open dashboard <ArrowUpRight size={15} aria-hidden="true" />
    </Link>
  ) : (
    <Link to="/login" className="button button--small">
      Get started <ArrowUpRight size={15} aria-hidden="true" />
    </Link>
  );

  return (
    <header
      className={['site-header', (scrolled || open) && 'site-header--solid', open && 'site-header--open']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="page-shell site-header__inner">
        <BrandMark />
        <nav className="site-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="site-header__actions">
          {!user && (
            <Link to="/login" className="text-link">
              Sign in
            </Link>
          )}
          {cta}
          <button
            className="menu-button"
            type="button"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="mobile-nav page-shell" aria-label="Mobile navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          {user ? (
            <Link to="/dashboard" className="button button--large">
              Open dashboard <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="button button--large">
                Get started <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/login" className="mobile-nav__secondary">
                Sign in
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
