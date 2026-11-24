import { Link, Route, Routes } from 'react-router-dom'
import { Status } from './components/Status'
import { journey } from './features/journey'
import { useService } from './hooks/useService'
import { Shell } from './layouts/Shell'
import { Dashboard } from './pages/Dashboard'
import { GestureCamera } from './components/GestureCamera'
import { gestures } from './features/gestures'
import { SafetyAssessment } from './pages/SafetyAssessment'
import { WorkplaceSafety } from './pages/WorkplaceSafety'
import { RecognitionCheck } from './pages/Recognition'

const emptyStates = {
  credentials: 'There are no credentials to display.',
  employment: 'There are no job listings to display.',
}

export function App() {
  const { connection, refresh } = useService()
  const service = connection.state === 'connected' ? connection.service : undefined
  const capability = (id: string) => service?.capabilities.get(id)
  const connectivity = <div className="connectivity">
    <span role="status" className={`connection ${connection.state}`}>
      {connection.state === 'loading' && 'Checking backend…'}
      {connection.state === 'connected' && 'Backend connected'}
    </span>
    {connection.state === 'error' && <><span className="connection error" role="alert">Backend unavailable</span><button type="button" className="retry" onClick={refresh}>Retry</button></>}
  </div>
  return <Shell connectivity={connectivity}>
    <Routes>
      <Route index element={<Dashboard capability={capability} />} />
      <Route path="/learn" element={<WorkplaceSafety availability={capability('vocational_learning')} />} />
      <Route path="/assessment" element={<SafetyAssessment />} />
      <Route path="/recognition" element={<>
        <div className="page-heading"><h1>Recognition practice</h1><p>Try three hand gestures for controlling the lesson and knowledge check.</p></div>
        <div className="mvp-grid">
          <GestureCamera instructions="Show one hand in good light and hold a gesture briefly." />
          <section className="panel gesture-guide">
            <h2>Supported gestures</h2>
            <ul>{Object.values(gestures).map(({ label, instruction }) => <li key={label}><strong>{label}</strong><p>{instruction}</p></li>)}</ul>
            <p>These are interface gestures. Indian Sign Language support is planned.</p>
            <Link to="/learn" className="button">Open workplace safety lesson</Link>
          </section>
        </div>
        <RecognitionCheck />
      </>} />
      {journey.filter(entry => entry.id === 'credentials' || entry.id === 'employment').map(({ path, title, description, id }) => (
        <Route key={path} path={path} element={<>
          <div className="page-heading">
            <Status state={capability(id) ?? 'planned'} />
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <section className="panel">
            <h2>Availability</h2>
            <p>{emptyStates[id]}</p>
          </section>
        </>} />
      ))}
      <Route path="/settings" element={<>
        <div className="page-heading"><h1>Settings</h1><p>Accessibility and privacy options.</p></div>
        <section className="panel"><h2>Accessibility preferences</h2><Status state="planned" />
          <p>Personal preferences are planned. SignSpeak currently follows your system’s reduced-motion setting and provides text for service updates.</p>
        </section>
      </>} />
      {import.meta.env.DEV && <Route path="/diagnostics" element={<>
        <div className="page-heading"><h1>Diagnostics</h1><p>Development service checks.</p></div>
        <section className="panel"><h2>Subsystem readiness</h2>
          <dl><dt>Service</dt><dd>{service?.status.status ?? 'Unknown'}</dd>
          <dt>Database</dt><dd>{service?.status.database ?? 'Unknown'}</dd>
          <dt>Recognition</dt><dd>{service?.status.recognition ?? 'Unavailable'}</dd></dl>
          <button type="button" onClick={refresh}>Refresh status</button>
        </section>
        <RecognitionCheck />
      </>} />}
      <Route path="*" element={<div className="page-heading"><h1>Page unavailable</h1><Link to="/">Return to overview</Link></div>} />
    </Routes>
  </Shell>
}
