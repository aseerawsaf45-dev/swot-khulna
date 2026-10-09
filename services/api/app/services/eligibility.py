from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..db.models import GroundTruthMeasurement, Site

def check_forecast_eligibility(db: Session, reach_id: str, target_variable: str) -> Dict[str, Any]:
    """
    Checks if there is enough data coverage to run a forecast for a specific target variable.
    """
    blocking_reasons = []
    
    # 1. Check if reach exists
    reach = db.query(Site).filter(Site.id == reach_id).first()
    if not reach:
        return {"eligible": False, "blocking_reasons": ["Reach not found."]}

    # 2. Check for recent observation density (e.g., last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    # Base query for recent observed data
    recent_obs = db.query(GroundTruthMeasurement).filter(
        GroundTruthMeasurement.site_id == reach_id,
        GroundTruthMeasurement.timestamp >= thirty_days_ago
    )
    
    if target_variable == "EC":
        valid_count = recent_obs.filter(GroundTruthMeasurement.target_variable == "EC").count()
        if valid_count < 5:
            blocking_reasons.append(f"Insufficient EC observations. Found {valid_count}, required 5 in the last 30 days.")
    
    elif target_variable == "water_elevation":
        valid_count = recent_obs.filter(GroundTruthMeasurement.target_variable == "water_elevation").count()
        if valid_count < 5:
            blocking_reasons.append(f"Insufficient water elevation observations. Found {valid_count}, required 5 in the last 30 days.")
    else:
        blocking_reasons.append(f"Target variable '{target_variable}' is not supported.")

    is_eligible = len(blocking_reasons) == 0
    return {
        "eligible": is_eligible,
        "blocking_reasons": blocking_reasons
    }
