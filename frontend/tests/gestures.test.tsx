import { expect, test } from 'vitest'
import { classifyHand, stabilizeGesture } from '../src/features/gestures'

const straight = [[0, 0], [0, 1], [0, 2], [0, 3]]
const curled = [[0, 0], [0, 1], [1, 1], [1, 0]]

function geometry(...fingers: number[][][]) {
  return [...Array.from({ length: 5 }, () => [0, 0]), ...fingers.flat()]
    .map(([x, y]) => ({ x, y, z: 0 }))
}

test('landmark rules distinguish the supported shapes and reject others', () => {
  expect(classifyHand(geometry(straight, straight, straight, straight))).toBe('palm')
  expect(classifyHand(geometry(straight, straight, curled, curled))).toBe('victory')
  expect(classifyHand(geometry(curled, curled, curled, curled))).toBe('fist')
  expect(classifyHand(geometry(straight, curled, curled, curled))).toBeNull()
  expect(classifyHand([])).toBeNull()
})

test('stabilization emits once for a hold and allows another event after release', () => {
  const read = stabilizeGesture()
  for (let i = 0; i < 3; i++) expect(read('palm').changed).toBe(false)
  expect(read('palm')).toEqual({ changed: true, gesture: 'palm' })
  expect(read('palm').changed).toBe(false)
  expect(read(null).gesture).toBe('palm')
  expect(read('palm').changed).toBe(false)
  for (let i = 0; i < 3; i++) read(null)
  for (let i = 0; i < 3; i++) expect(read('palm').changed).toBe(false)
  expect(read('palm')).toEqual({ changed: true, gesture: 'palm' })
})
