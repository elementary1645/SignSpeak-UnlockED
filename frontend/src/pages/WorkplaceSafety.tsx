import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GestureCamera } from '../components/GestureCamera'
import { Status } from '../components/Status'
import type { CapabilityState } from '../types/contracts'
import { sections } from '../features/workplaceSafety'

export function WorkplaceSafety({ availability }: { availability?: CapabilityState }) {
  const [step, setStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)
  const section = sections[step]
  const last = step === sections.length - 1
  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus()
      previousStep.current = step
    }
  }, [step])

  function next() {
    setStep(value => Math.min(value + 1, sections.length - 1))
  }

  return <>
    <div className="page-heading"><Status state={availability ?? 'available'} /><h1>Learn</h1><p>Workplace Safety Fundamentals</p></div>
    <div className="mvp-grid">
      <section className="panel lesson-panel" aria-labelledby="section-title">
        <p className="step-count">Section {step + 1} of {sections.length}</p>
        <div className="lesson-icon" aria-hidden="true">{section.icon}</div>
        <h2 id="section-title" tabIndex={-1} ref={heading}>{section.title}</h2>
        <p>{section.text}</p>
        <p className="takeaway"><strong>What to do</strong> {section.takeaway}</p>
        <div className="actions">
          {step > 0 && <button type="button" className="secondary" onClick={() => setStep(step - 1)}>Previous section</button>}
          {last
            ? <Link className="button" to="/assessment">Start assessment</Link>
            : <button type="button" onClick={next}>Next section</button>}
        </div>
      </section>
      <GestureCamera instructions={last
        ? 'Use Start assessment when you are ready.'
        : 'Optional: hold an open palm to move to the next section.'}
        onGesture={gesture => { if (gesture === 'palm') next() }} />
    </div>
  </>
}
