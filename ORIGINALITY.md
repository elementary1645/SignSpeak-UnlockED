# Originality and provenance

SignSpeak Phase 1 was authored in the supplied checkout for wHACKiest 2026, Track 4 – UnlockED. The starting checkout contained only a README heading. No previous SignSpeak repository was cloned, forked, inspected, imported or consulted during this implementation. Application code, tests, design, styles, documentation and protocol were created for this repository with AI coding assistance. Git records the actual development changes.

Do not import or adapt code, datasets, models, trained weights, configuration, documents or UI components from previous projects. Use established open-source dependencies under their licences and the event rules. Preserve real Git history and record the source, version, licence and permitted use of any future data, model or asset before inclusion.

| Source | Direct dependencies and tooling |
| --- | --- |
| PyPI and Python standard library | FastAPI, Pydantic, Pydantic Settings, SQLAlchemy, Uvicorn, websockets, HTTPX, Pytest, Ruff, setuptools, pip and pip-tools |
| npm | React, React DOM, React Router, TypeScript, Vite and its React plugin, Tailwind CSS and its Vite plugin, Vitest, jsdom, Testing Library, Playwright, DefinitelyTyped packages and ESLint tooling |
| GitHub Actions and Microsoft Dev Containers | Checkout, Python and Node setup actions, Python dev-container image and Node feature |
| Playwright browser distribution | Chromium used for local and CI browser verification |

The npm and pip-tools lockfiles record resolved distributions and integrity metadata. Installed packages retain their upstream licence notices. The root MIT licence applies to original project files. The interface uses system fonts and original CSS shapes. Phase 1 adds no third-party artwork, dataset, weights or model artefacts.

## First-round MVP additions

The lesson, questions, gesture rules, stabilization, camera UI and tests were written in this checkout. No earlier dataset or trained gesture classifier was used. The tests use generated coordinate arrays to check the rules, with no captured personal data.

- The npm dependency `@mediapipe/tasks-vision@0.10.32` and its bundled JavaScript and WASM runtime come from [Google MediaPipe](https://github.com/google-ai-edge/mediapipe) under Apache 2.0.
- The app downloads Google's unmodified [Hand Landmarker float16 v1 model](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task) from the upstream distribution at runtime. It is a general-purpose landmark detector. The downloaded copy verified during development had SHA-256 `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`. [Model and API documentation](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web)
- Lesson icons are Unicode symbols rendered by the system font. The MVP adds no external artwork.
- The original lesson text was checked against general safety references. [PPE](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.132), [hazard prevention](https://www.osha.gov/safety-management/hazard-prevention) and [workplace emergency planning](https://www.osha.gov/etools/evacuation-plans-procedures/eap).
