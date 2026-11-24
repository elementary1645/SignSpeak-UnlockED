# Database design

Phase 1 opens and probes SQLite through SQLAlchemy. SQLite foreign-key enforcement is enabled on each connection. The app owns engine startup and disposal. There are no domain tables. `DeclarativeBase` gives future models one metadata registry. Add Alembic and a reviewed initial revision when the first entities arrive. Use migrations for schema changes and test upgrades on copies with foreign keys enabled.

```mermaid
erDiagram
    USER_PROFILE ||--o| ACCESSIBILITY_PREFERENCES : configures
    USER_PROFILE ||--o{ SKILL_PROFILE : records
    USER_PROFILE ||--o{ LEARNING_PROGRESS : tracks
    LEARNING_MODULE ||--o{ LESSON : contains
    LESSON ||--o{ LEARNING_PROGRESS : measures
    LEARNING_MODULE ||--o{ ASSESSMENT : defines
    ASSESSMENT ||--o{ ASSESSMENT_ATTEMPT : receives
    USER_PROFILE ||--o{ ASSESSMENT_ATTEMPT : submits
    ASSESSMENT_ATTEMPT ||--o{ ASSESSMENT_EVIDENCE : contains
    ASSESSMENT_ATTEMPT ||--o{ CREDENTIAL : supports
    CREDENTIAL ||--o{ CREDENTIAL_VERIFICATION : records
    EMPLOYMENT_OPPORTUNITY ||--o{ OPPORTUNITY_SKILL : requires
    SKILL ||--o{ OPPORTUNITY_SKILL : describes
    SKILL ||--o{ SKILL_PROFILE : describes
```

Use unique learner/lesson progress rows, versioned assessments, immutable scoring evidence references, independently reviewed credential status and minimum disclosure in verification. Keep accessibility preferences private by default. Store future evidence outside the public web root and apply retention policies independently of the credential record. Employment opportunities and learner skill profiles can share a skill taxonomy without exposing preference data. Reassess SQLite concurrency using actual workloads.
