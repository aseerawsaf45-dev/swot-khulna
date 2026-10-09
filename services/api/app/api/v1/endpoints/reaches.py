from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from services.api.app.db.session import get_db
from services.api.app.db.models import Site, HydroObservation, Forecast
from services.api.app.schemas.domain import ReachResponse, HydroObservationResponse, ForecastResponse

router = APIRouter()

@router.get("/", response_model=List[ReachResponse])
def get_reaches(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(Site)
    return query.offset(skip).limit(limit).all()

@router.get("/{reach_id}", response_model=ReachResponse)
def get_reach(reach_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == reach_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Reach/Site not found")
    return site

@router.get("/{reach_id}/observations", response_model=List[HydroObservationResponse])
def get_reach_observations(
    reach_id: str, 
    skip: int = 0, 
    limit: int = 500,
    db: Session = Depends(get_db)
):
    query = db.query(HydroObservation).filter(HydroObservation.site_id == reach_id)
    return query.order_by(HydroObservation.timestamp.desc()).offset(skip).limit(limit).all()

@router.get("/{reach_id}/forecasts", response_model=List[ForecastResponse])
def get_reach_forecasts(reach_id: str, db: Session = Depends(get_db)):
    # Returns experimental forecasting data
    forecasts = db.query(Forecast).filter(Forecast.site_id == reach_id).all()
    return forecasts

