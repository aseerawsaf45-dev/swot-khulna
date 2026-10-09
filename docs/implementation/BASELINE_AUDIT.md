# Baseline Audit: SWOT Hydrological Modeling in Khulna

## 1. Execution of Current Documented Commands
**Command:** `make test`
**Environment:** Windows PowerShell
**Result:** 
```text
make : The term 'make' is not recognized as the name of a cmdlet, function, script file, or operable program.
```
*Note: The project relies on `make` which is not native to Windows. Needs documentation for Windows users or a script alternative.*

**Command:** `python -m pytest tests`
**Result:**
```text
=================================== ERRORS ====================================
ImportError while importing test module '.../tests/test_api.py'.
ModuleNotFoundError: No module named 'psycopg'

ImportError while importing test module '.../tests/test_pinn.py'.
ModuleNotFoundError: No module named 'torch'
```
*Note: Dependencies are not properly locked or documented. They must be installed before tests can run.*

## 2. Existing Files and Responsibilities
- **`pyproject.toml` / `package.json`**: Basic dependency shells. `pyproject.toml` lacks actual requirements (`torch`, `psycopg`, `fastapi`, `alembic`).
- **`compose.yaml`**: Sets up Postgres and API services, but API service likely crashes on boot due to missing dependencies.
- **`ml/models/pinn.py` & `loss.py`**: Mathematical definitions for PINN and Fourier features. Not connected to data.
- **`ml/training/trainer.py`**: Training loop shell. Doesn't load real data.
- **`services/api/app/api/v1/endpoints/data_hub.py`**: Shell for the Hydrocron data hub. 
- **`services/api/app/adapters/hydrocron.py`**: Basic HTTPX adapter to PO.DAAC. Not tested, no persistence logic.
- **`tests/`**: Contains exactly two minimal tests (`test_api.py`, `test_pinn.py`).

## 3. Missing Architecture
- **Migrations:** `alembic` folder is completely missing, despite being referenced in the `Makefile`.
- **Database Models:** No SQLAlchemy models exist.
- **Dependency Lockfile:** Missing `poetry.lock`, `uv.lock`, or `requirements.txt`.
- **Scientific Datasets:** No historical ground-truth (EC/salinity) datasets exist in the repository.

## 4. State of Functionality (Implemented vs Mocked)
- **Implemented:** 
  - Basic PyTorch model class structure (`PINN`).
  - PyTorch autograd loss functions for ADE.
  - Basic Next.js layout (`apps/web/app/page.tsx`).
- **Mocked / Placeholder:**
  - API endpoints return fake job IDs (`job-csv-import-001`).
  - `HydrocronAdapter.check_health` pings the root domain but does no data validation.
- **Not Implemented:**
  - Database schema / ORM.
  - PINN training loop with real datasets.
  - Dashboard API integration.
  - Forecast evaluation and validation loops.
  - Tidal aliasing handling and temporal leakage prevention.
