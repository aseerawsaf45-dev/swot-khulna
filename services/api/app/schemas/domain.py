from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class DataClassEnum(str, Enum):
    OBSERVED = "observed"
    ASSIMILATED = "assimilated"
    PREDICTED = "predicted"
    DEMO = "demo"

class SiteResponse(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ReachResponse(SiteResponse):
    pass # Alias for frontend compatibility

class HydroObservationResponse(BaseModel):
    id: str
    site_id: str
    timestamp: datetime
    source_variable: str
    value: float
    original_unit: str
    quality_flag: Optional[str] = None
    is_missing: bool
    model_config = ConfigDict(from_attributes=True)

class ForecastResponse(BaseModel):
    id: str
    site_id: str
    target_time: datetime
    target_variable: str
    value: float
    unit: str
    validation_status: str
    model_config = ConfigDict(from_attributes=True)

