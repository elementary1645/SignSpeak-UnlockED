import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { journey } from '../features/journey'

export function Shell({ children, connectivity }: { children: ReactNode; connectivity: ReactNode }) {
  const { pathname } = useLocation()
  const lastPath = useRef(pathname)
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    const heading = main.current?.querySelector('h1')
    if (heading) document.title = `${heading.textContent} · SignSpeak`
    if (lastPath.current !== pathname) {
      main.current?.focus()
      lastPath.current = pathname
    }
  }, [pathname])
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="site-header">
      <div className="frame topbar">
        <NavLink to="/" className="brand" aria-label="SignSpeak home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>SignSpeak<small>Skill Without Barriers</small></span>
        </NavLink>
        {connectivity}
      </div>
      <nav className="frame nav" aria-label="Main navigation">
        <NavLink to="/" end>Overview</NavLink>
        {journey.map(({ path, title }) => <NavLink key={path} to={path}>{title}</NavLink>)}
        <NavLink to="/settings">Settings</NavLink>
        {import.meta.env.DEV && <NavLink to="/diagnostics">Diagnostics</NavLink>}
      </nav>
    </header>
    <main className="frame main-content" id="main-content" ref={main} tabIndex={-1}>{children}</main>
    <footer className="frame footer"><strong>SignSpeak</strong><span>wHACKiest 2026 · Track 4 UnlockED</span></footer>
  </>
}
