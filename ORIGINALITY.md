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
