from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class UploadResponse(BaseModel):
    filename: str
    status: str
    job_id: str
    message: str

class HydrocronHealthResponse(BaseModel):
    status: str
    service: str

class HealthResponse(BaseModel):
    status: str
    db: Optional[str] = None
