import { Link, Route, Routes } from 'react-router-dom'
import { Status } from './components/Status'
import { journey } from './features/journey'
import { useService } from './hooks/useService'
import { Shell } from './layouts/Shell'
import { Dashboard } from './pages/Dashboard'
import { RecognitionCheck } from './pages/Recognition'

const emptyStates = {
  vocational_learning: 'Learning modules will appear here when available.',
  sign_recognition: 'This phase supports connection checks. Sign input is unavailable.',
  competency_assessment: 'Assessment activities will appear here when available. Practical skills require separate evidence.',
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
      {journey.map(({ path, title, description, id }) => (
        <Route key={path} path={path} element={<>
          <div className="page-heading">
            <Status state={capability(id) ?? (id === 'sign_recognition' ? 'unavailable' : 'planned')} />
            <h1>{id === 'sign_recognition' ? 'Recognition practice' : title}</h1>
            <p>{description}</p>
          </div>
          <section className="panel">
            <h2>{id === 'sign_recognition' ? 'Sign input' : 'Availability'}</h2>
            <p>{emptyStates[id]}</p>
          </section>
          {id === 'sign_recognition' && <RecognitionCheck />}
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
