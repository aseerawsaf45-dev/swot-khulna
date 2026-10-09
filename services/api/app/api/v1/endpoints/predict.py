import torch
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
import sys

# Add ml path so we can import the model
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../../../"))
try:
    from ml.models.pinn import SaltIntrusionPINN
except ImportError:
    pass

router = APIRouter()

class PredictionRequest(BaseModel):
    reach_id: str
    time_series_days: List[float]
    water_elevation: List[float]
    discharge: List[float]

class PredictionResponse(BaseModel):
    reach_id: str
    predicted_salinity_ec: List[float]
    model_version: str = "PINN v1.2"
    disclaimer: str = "EXPERIMENTAL - SYNTHETIC PROJECTION"

@router.post("/", response_model=PredictionResponse)
def run_live_inference(request: PredictionRequest):
    """
    Industry-grade live inference endpoint.
    Loads the compiled PyTorch PINN model artifact into memory and runs a forward pass.
    """
    model_path = os.path.join(os.path.dirname(__file__), "../../../../../ml/artifacts/pinn_latest.pt")
    
    if not os.path.exists(model_path):
        raise HTTPException(status_code=500, detail="Model artifact pinn_latest.pt not found on server.")
    
    # 1. Load Model Architecture
    model = SaltIntrusionPINN(in_features=3, hidden_dim=64, num_layers=4)
    
    # 2. Load Trained Weights
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    
    # 3. Preprocess Input Tensors
    if len(request.time_series_days) != len(request.water_elevation) or len(request.time_series_days) != len(request.discharge):
        raise HTTPException(status_code=400, detail="Input lists must be of equal length.")
        
    X_input = []
    for t, w, d in zip(request.time_series_days, request.water_elevation, request.discharge):
        X_input.append([t, w, d])
        
    X_tensor = torch.tensor(X_input, dtype=torch.float32)
    
    # 4. Execute Forward Pass (Live Prediction)
    with torch.no_grad():
        predictions = model(X_tensor).numpy().flatten().tolist()
        
    return PredictionResponse(
        reach_id=request.reach_id,
        predicted_salinity_ec=[round(p, 3) for p in predictions]
    )
