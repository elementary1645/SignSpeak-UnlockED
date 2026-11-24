export const gestures = {
  palm: { label: 'Open palm', instruction: 'Hold four fingers straight with your palm facing the camera.' },
  victory: { label: 'V sign', instruction: 'Raise your index and middle fingers and curl your ring and little fingers.' },
  fist: { label: 'Closed fist', instruction: 'Curl all four fingers into your palm.' },
} as const

export type Gesture = keyof typeof gestures
type Point = { x: number; y: number; z: number }
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)

export function classifyHand(points: Point[]): Gesture | null {
  if (points.length !== 21) return null
  const fingers = [5, 9, 13, 17].map(start => {
    const [base, middle, joint, tip] = points.slice(start, start + 4)
    const length = distance(base, middle) + distance(middle, joint) + distance(joint, tip)
    const reach = distance(base, tip) / length
    // The gap rejects ambiguous bends. These are geometry cutoffs, not probabilities.
    if (reach >= 0.9) return 'straight'
    if (reach <= 0.78) return 'curled'
    return 'ambiguous'
  }).join(',')
  switch (fingers) {
    case 'straight,straight,straight,straight': return 'palm'
    case 'straight,straight,curled,curled': return 'victory'
    case 'curled,curled,curled,curled': return 'fist'
    default: return null
  }
}

export function stabilizeGesture() {
  let candidate: Gesture | null = null
  let stable: Gesture | null = null
  let count = 0
  return (sample: Gesture | null): { changed: boolean; gesture: Gesture | null } => {
    if (candidate !== sample) {
      candidate = sample
      count = 0
    }
    count++
    const changed = candidate !== stable && count >= (candidate === null ? 3 : 4)
    if (changed) stable = candidate
    return { changed, gesture: stable }
  }
}
