import { useEffect, useRef, useState } from 'react'
import type { HandLandmarker } from '@mediapipe/tasks-vision'
import { classifyHand, gestures, stabilizeGesture, type Gesture } from '../features/gestures'

function cameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera permission was denied. Allow camera access in your browser to retry, or continue with the controls.'
  }
  if (name === 'NotFoundError') return 'No camera was found. You can continue with the controls.'
  return 'The camera could not start. Check whether another app is using it, or continue with the controls.'
}

export function GestureCamera({ instructions, onGesture }: {
  instructions: string
  onGesture?: (gesture: Gesture) => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const cancel = useRef<() => void>(undefined)
  const callback = useRef(onGesture)
  const [state, setState] = useState<'idle' | 'starting' | 'running'>('idle')
  const [error, setError] = useState('')
  const [label, setLabel] = useState<Gesture | null>(null)
  useEffect(() => { callback.current = onGesture }, [onGesture])
  useEffect(() => () => cancel.current?.(), [])

  async function start() {
    if (cancel.current) return
    setError('')
    setLabel(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access requires a supported browser on localhost or HTTPS. You can continue with the controls.')
      return
    }

    const controller = new AbortController()
    const { signal } = controller
    const preview = video.current!
    let stream: MediaStream | undefined
    let landmarker: HandLandmarker | undefined
    let frame = 0
    let modelTimer = 0
    let failure = 'Gesture detection could not load. Check your internet connection and try again, or continue with the controls.'
    const stop = () => {
      cancel.current = undefined
      controller.abort()
      cancelAnimationFrame(frame)
      clearTimeout(modelTimer)
      stream?.getTracks().forEach(track => track.stop())
      landmarker?.close()
      preview.srcObject = null
    }
    const fail = (message: string) => {
      stop()
      setState('idle')
      setError(message)
    }
    cancel.current = stop
    setState('starting')

    try {
      const opened = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      if (signal.aborted) {
        opened.getTracks().forEach(track => track.stop())
        return
      }
      stream = opened
      for (const track of stream.getVideoTracks()) {
        track.addEventListener('ended', () => {
          if (!signal.aborted) fail('The camera disconnected. Restart it or continue with the controls.')
        }, { once: true })
      }
      preview.srcObject = stream
      await preview.play()
      if (signal.aborted) return
    } catch (error) {
      if (!signal.aborted) fail(cameraError(error))
      return
    }

    try {
      modelTimer = window.setTimeout(() => fail(failure), 20000)
      const { createHandLandmarker } = await import('../services/handLandmarker')
      if (signal.aborted) return
      const detector = await createHandLandmarker(signal)
      if (signal.aborted) {
        detector.close()
        return
      }
      clearTimeout(modelTimer)
      landmarker = detector
      failure = 'Gesture detection stopped. Restart the camera or continue with the controls.'
      setState('running')

      const stabilize = stabilizeGesture()
      let lastFrame = -Infinity
      let lastVideoTime = -1
      function readFrame(now: number) {
        try {
          if (preview.readyState >= 2 && preview.currentTime !== lastVideoTime && now - lastFrame >= 80) {
            lastVideoTime = preview.currentTime
            lastFrame = now
            const result = detector.detectForVideo(preview, now)
            const reading = stabilize(classifyHand(result.worldLandmarks[0] ?? []))
            if (reading.changed) {
              setLabel(reading.gesture)
              if (reading.gesture) callback.current?.(reading.gesture)
            }
          }
          frame = requestAnimationFrame(readFrame)
        } catch {
          fail(failure)
        }
      }
      frame = requestAnimationFrame(readFrame)
    } catch {
      if (!signal.aborted) fail(failure)
    }
  }

  return <section className="panel camera-panel" aria-labelledby="camera-title">
    <h2 id="camera-title">Gesture camera</h2>
    <p>{instructions}</p>
    <p>Camera video stays in your browser. Lower your hand between gestures.</p>
    <video ref={video} muted playsInline hidden={state === 'idle'} aria-label="Live webcam preview" />
    <div className="actions">
      <button type="button" onClick={() => {
        if (cancel.current) {
          cancel.current()
          setState('idle')
        } else {
          void start()
        }
      }}>{state === 'idle' ? 'Start camera' : 'Stop camera'}</button>
    </div>
    {state !== 'idle' && <p role="status">{state === 'starting'
      ? 'Starting camera and loading hand detection…'
      : label ? `Detected: ${gestures[label].label}` : 'Ready. No supported gesture detected.'}</p>}
    {error && <p role="alert">{error}</p>}
  </section>
}
