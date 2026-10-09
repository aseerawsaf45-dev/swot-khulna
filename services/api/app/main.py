from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .api.v1.router import api_router
from .db.session import get_db
from .schemas.models import HealthResponse

app = FastAPI(
    title="SWOT Khulna API",
    description="API for the SWOT Khulna Platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health/live", response_model=HealthResponse)
def health_live():
    return {"status": "ok"}

@app.get("/health/ready", response_model=HealthResponse)
def health_ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ready"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database not ready")
