import { Link } from 'react-router-dom'
import { Status } from '../components/Status'
import { journey } from '../features/journey'
import type { CapabilityState } from '../types/contracts'

export function Dashboard({ capability }: { capability: (id: string) => CapabilityState | undefined }) {
  return <>
    <section className="hero" aria-labelledby="overview-title">
      <div className="hero-content">
        <p className="eyebrow">Accessible vocational education</p>
        <h1 id="overview-title">Skill Without<br className="hero-break" /> Barriers</h1>
        <p className="intro">A path from vocational learning to employment for deaf and hard-of-hearing learners.</p>
        <div className="hero-actions">
          <Link className="button hero-button" to="/recognition">Try gesture camera</Link>
          <Link className="button hero-button hero-secondary" to="/learn">Open safety lesson</Link>
        </div>
      </div>
      <div className="hero-pattern" aria-hidden="true"><i /><i /><i /></div>
    </section>
    <section className="journey" aria-labelledby="journey-title">
      <h2 id="journey-title">Your learning journey</h2>
      <ol className="journey-grid">
        {journey.map(({ title, path, description, id }) => (
          <li className="journey-card" key={id}>
            <Status state={capability(id) ?? (['credentials', 'employment'].includes(id) ? 'planned' : 'available')} />
            <h3><Link to={path}>{title}</Link></h3>
            <p>{description}</p>
          </li>
        ))}
      </ol>
    </section>
  </>
}
