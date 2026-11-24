import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GestureCamera } from '../components/GestureCamera'
import { questions } from '../features/workplaceSafety'

const gestureChoices = { palm: 0, victory: 1, fist: 2 }

export function SafetyAssessment() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number>()
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const previousIndex = useRef(index)
  const question = questions[index]
  useEffect(() => {
    if (previousIndex.current !== index) {
      heading.current?.focus()
      previousIndex.current = index
    }
  }, [index])

  function advance() {
    setSelected(undefined)
    setConfirmed(false)
    setIndex(index + 1)
  }

  return <>
    <div className="page-heading"><h1>Assessment</h1><p>Workplace Safety Fundamentals knowledge check</p></div>
    {question ? <div className="mvp-grid">
      <section className="panel lesson-panel" aria-labelledby="question-title">
        <p className="step-count">Question {index + 1} of {questions.length}</p>
        <h2 id="question-title" tabIndex={-1} ref={heading}>{question.prompt}</h2>
        <form onSubmit={event => {
          event.preventDefault()
          if (confirmed || selected === undefined) return
          setConfirmed(true)
          if (selected === question.correct) setScore(score + 1)
        }}>
          <fieldset disabled={confirmed}>
            <legend>Choose one answer</legend>
            {question.options.map((option, choice) => <label className="answer" key={option}>
              <input type="radio" name="answer" checked={selected === choice} onChange={() => setSelected(choice)} />
              <span><strong>{String.fromCharCode(65 + choice)}.</strong> {option}</span>
            </label>)}
          </fieldset>
          <div role="status">
            {confirmed && <p className="takeaway"><strong>{selected === question.correct ? 'Correct.' : 'Incorrect.'}</strong> {question.explanation}</p>}
          </div>
          <div className="actions">
            {confirmed
              ? <button type="button" onClick={advance}>{index + 1 === questions.length ? 'View score' : 'Next question'}</button>
              : <button type="submit" aria-disabled={selected === undefined}>Confirm answer</button>}
          </div>
        </form>
      </section>
      <GestureCamera instructions="Open palm selects A, V sign selects B, and closed fist selects C. Use Confirm answer to submit."
        onGesture={gesture => { if (!confirmed) setSelected(gestureChoices[gesture]) }} />
    </div> : <section className="panel lesson-panel" aria-labelledby="score-title">
      <h2 id="score-title" ref={heading} tabIndex={-1}>Assessment complete</h2>
      <p className="score">{score} out of {questions.length} correct</p>
      <p className="completion-badge">Workplace Safety Fundamentals · Knowledge Check Completed</p>
      <p>This badge records completion of this knowledge check. It carries no vocational accreditation.</p>
      <div className="actions">
        <button type="button" onClick={() => { setScore(0); setIndex(0) }}>Try again</button>
        <Link className="button secondary" to="/learn">Review lesson</Link>
      </div>
    </section>}
  </>
}
