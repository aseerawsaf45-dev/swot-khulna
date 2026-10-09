$ErrorActionPreference = "Stop"
. .venv\Scripts\Activate.ps1
$env:DATABASE_URL="sqlite:///khulna.db"
python -m pytest tests
