# scripts/setup.ps1
$ErrorActionPreference = "Stop"

Write-Host "Setting up khulna-salt-intrusion virtual environment..."

if (-not (Test-Path ".venv")) {
    python -m venv .venv
}

# Activate venv
. .venv\Scripts\Activate.ps1

Write-Host "Installing dependencies..."
python -m pip install --upgrade pip
pip install -e .[dev]

Write-Host "Generating lockfile..."
pip freeze > requirements.lock

if (-not (Test-Path "alembic")) {
    Write-Host "Initializing Alembic..."
    alembic init alembic
    
    # Configure alembic.ini
    (Get-Content alembic.ini) -replace 'sqlalchemy.url = driver://user:pass@localhost/dbname', 'sqlalchemy.url = postgresql+psycopg://swot_app:change-me-local-only@localhost:5432/khulna_salt_intrusion' | Set-Content alembic.ini
    
    # Configure env.py to use models
    $envPy = Get-Content alembic\env.py -Raw
    $envPy = $envPy -replace 'target_metadata = None', "import sys`nimport os`nsys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))`nfrom services.api.app.db.models import Base`ntarget_metadata = Base.metadata"
    Set-Content alembic\env.py $envPy
}

Write-Host "Setup complete. To apply migrations, make sure your database is running and run:"
Write-Host ".venv\Scripts\alembic upgrade head"
