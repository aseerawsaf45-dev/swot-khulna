from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.api.app.db.session import get_db
from services.api.app.services.eligibility import check_forecast_eligibility

router = APIRouter()

@router.get("/reach/{reach_id}")
def get_eligibility(reach_id: int, target: str = "salinity", db: Session = Depends(get_db)):
    """Return whether a forecast is eligible to run, and the blocking reasons if any."""
    result = check_forecast_eligibility(db, reach_id, target)
    return result
