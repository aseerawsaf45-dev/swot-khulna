# Execution Plan: Production-Quality Research Prototype

## Phase 1: Make the application runnable
*Goal: Deterministic installs, database schemas, and working tests.*

### File-by-file plan:
1. **`pyproject.toml` & `requirements.txt` / `uv.lock`**:
   - Define all dependencies (`fastapi`, `sqlalchemy`, `alembic`, `psycopg`, `torch`, `httpx`, `pytest`).
2. **`alembic/` & `alembic.ini`**:
   - Initialize Alembic.
   - Create initial migration for: `sites`, `source_datasets`, `hydro_observations`, `ground_truth_measurements`.
3. **`services/api/app/db/models.py`**:
   - Implement SQLAlchemy ORM models matching the tables above.
4. **`services/api/app/schemas/`**:
   - Add Pydantic validation schemas for endpoints.
5. **`Makefile`**:
   - Add cross-platform instructions or a `scripts/setup.ps1` for Windows users.

**Acceptance Test:** `python -m pytest tests` passes. `alembic upgrade head` creates tables on a fresh DB. 

---

## Phase 2: Build the real data pipeline
*Goal: Ingest real Hydrocron observations and ground-truth EC datasets.*

### File-by-file plan:
1. **`services/api/app/adapters/hydrocron.py`**:
   - Add validation, pagination, and bounded retries using `tenacity`.
   - Ensure timestamp and source ID provenance is preserved.
2. **`services/api/app/api/v1/endpoints/data_hub.py`**:
   - Replace mocks. Connect CSV uploads to pandas validation and `ground_truth_measurements` table insertion.
3. **`tests/test_ingestion.py`**:
   - Test idempotent inserts (running ingestion twice produces no duplicates).

**Acceptance Test:** Ingesting a known SWOT reach range stores valid records in Postgres. Re-running it creates 0 new rows.

---

## Phase 3: Establish scientific validity
*Goal: Train the PINN and evaluate it against a persistence baseline.*

### File-by-file plan:
1. **`ml/data/loader.py`**:
   - Query DB for joined `hydro_observations` and `ground_truth_measurements`.
   - Handle temporal alignment and geographic tolerances.
2. **`ml/models/pinn.py` & `ml/models/loss.py`**:
   - Add unit tests for boundary conditions and analytic PDE solutions.
3. **`ml/training/train.py` & `ml/evaluation/evaluate.py`**:
   - Implement rigorous chronological splitting.
   - Output metric JSONs (MAE, RMSE, Bias).
4. **`ml/tests/test_science.py`**:
   - Ensure the PINN trains deterministically and metrics beat persistence on the held-out set.

**Acceptance Test:** `python -m ml.evaluation.evaluate` outputs a reproducible report showing evaluation strictly on unseen temporal data, outperforming the baseline.

---

## Phase 4: Build the premium product experience
*Goal: Connect the Next.js dashboard to real endpoints with accurate scientific context.*

### File-by-file plan:
1. **`apps/web/app/page.tsx` & `apps/web/components/`**:
   - Replace static dashboard with data-fetching components hitting the FastAPI backend.
   - Add Recharts for time series. 
   - Ensure prediction intervals and "experimental" labels are visibly tied to forecasts.
2. **`services/api/app/api/v1/endpoints/reaches.py`**:
   - Update to return actual forecasting outputs alongside metadata.

**Acceptance Test:** End-to-end Playwright test navigating from site selection to forecast viewing, properly displaying missing-data states if inputs are stale.

---

## Phase 5: Verify and deploy
*Goal: Security, monitoring, and final acceptance.*

### File-by-file plan:
1. **`.github/workflows/ci.yml`**:
   - Implement automated linting, type-checking, tests, and migration checks.
2. **`services/api/app/main.py`**:
   - Add CORS, rate limiting, and structured logging.

**Acceptance Test:** A clean `git clone` allows a new developer to run `make setup && make up && make test` successfully without undocumented steps.
