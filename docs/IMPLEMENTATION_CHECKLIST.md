# Implementation Checklist

## Milestone 0 — Workspace reconnaissance
- [x] Read all project docs and inspect any existing repo before overwriting files.
- [x] List actual current functionality, build errors, missing pieces and conflicts with this blueprint.
- [x] Create a checklist and confirm the proposed repo shape.

## Milestone 1 — Repository and local runtime
- [x] Create monorepo directories, pnpm workspace and Python `pyproject.toml`/`uv.lock`.
- [x] Scaffold Next.js App Router/strict TypeScript and FastAPI.
- [x] Add PostGIS Postgres, Redis, Celery worker and Docker Compose health checks.
- [x] Configure environment validation, CORS, logging, migrations and API health endpoints.
- [x] Add deterministic seed script and frontend public shell.
- [x] Add `Makefile`, README and `.env.example`.

## Milestone 2 — Visual foundation and design system
- [x] Implement typography, semantic tokens, layout grid, navigation, buttons, forms, cards, badges, drawers, toasts, skeletons and empty/error states.
- [x] Build responsive landing page and workspace shell.
- [x] Implement reduced motion and keyboard/focus styles.

## Milestone 3 — Canonical domain and demo vertical slice
- [x] Implement models/migrations for regions/sites/reaches/observations/jobs/datasets/lineage/forecast runs/alerts.
- [x] Build API schemas and generated frontend client.
- [x] Seed transparent synthetic data and show it in map/table/charts with demo labels.
- [x] Implement reach detail, observation filters and source provenance.

## Milestone 4 — Data hub and Hydrocron adapter
- [x] Implement endpoint adapter; add live health check and a harmless small query example.
- [x] Keep endpoint/collection configurable and verify collection/field parameters from official docs.
- [x] Implement fetch job lifecycle, rate limits, cache, data quality rules, source/collection metadata and failure states.
- [x] Implement CSV upload/mapping/validation/preview/error file/confirmation/lineage.

## Milestone 5 — Data eligibility and scientific baseline
- [x] Add coverage report for target observations, feature covariates and time alignment.
- [x] Implement forecast eligibility API with blocking reasons.
- [x] Implement seasonal/persistence baseline and a basic statistical comparator.
- [x] Build experiment job, result chart and reproducible metric manifest.

## Milestone 6 — PINN and Fourier feature experiment
- [x] Confirm the exact ADE formulation and boundary/initial conditions with a domain reviewer.
- [x] Implement PDE residual and manufactured-solution tests.
- [x] Implement standard PINN, Fourier-feature encoding and composite loss.
- [x] Add training diagnostics, run metadata, artifact checksums and CPU fallback.
- [x] Compare against baselines under identical temporal splits.

## Milestone 7 — Assimilation and uncertainty
- [x] Define gauge-to-reach mapping and vertical datum policy.
- [x] Implement a documented assimilation/state-estimation adapter if enough gauge observations exist.
- [x] Preserve raw observation/reconstructed state distinction.
- [x] Evaluate uncertainty calibration and reliability by season/lead time.

## Milestone 8 — Scenario, alert, report and governance
- [x] Configurable locally approved threshold rules.
- [x] Scenario comparison with visible assumptions.
- [x] Alert lifecycle, acknowledgements, expiry and audit logs.
- [x] Export reports with provenance/disclaimers and signed download URLs.
- [x] Model approval, publication and withdrawal workflow.

## Milestone 9 — QA, accessibility and deployment
- [x] Complete API/web/ML/E2E tests, accessibility checks, performance pass and source-failure tests.
- [x] Configure CI and production deployment examples.
- [x] Add backups, migration/rollback steps, structured logs and source/model operation runbooks.
- [x] Conduct scientific language review.
