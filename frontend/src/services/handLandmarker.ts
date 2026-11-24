import { HandLandmarker } from '@mediapipe/tasks-vision'
import wasmLoaderPath from '../../node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_nosimd_internal.js?url'
import wasmBinaryPath from '../../node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_nosimd_internal.wasm?url'

const modelUrl = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

export async function createHandLandmarker(signal: AbortSignal) {
  const response = await fetch(modelUrl, { signal })
  if (!response.ok) throw new Error('Hand landmark model download failed')
  const modelAssetBuffer = new Uint8Array(await response.arrayBuffer())
  signal.throwIfAborted()
  return HandLandmarker.createFromOptions({ wasmLoaderPath, wasmBinaryPath }, {
    baseOptions: { modelAssetBuffer, delegate: 'CPU' },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.65,
    minHandPresenceConfidence: 0.65,
    minTrackingConfidence: 0.6,
  })
}
