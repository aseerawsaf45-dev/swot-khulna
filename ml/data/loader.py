import pandas as pd
import numpy as np
import torch
from sqlalchemy.orm import Session
from typing import Tuple
from services.api.app.db.models import HydroObservation, GroundTruthMeasurement
from services.api.app.db.session import SessionLocal

def load_aligned_data(db: Session = None, synthetic_fallback: bool = False) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, bool]:
    """
    Loads aligned hydro observations and ground truth measurements from the DB.
    Returns tensors for (x, t, u) suitable for PINN training, plus a boolean is_synthetic.
    """
    if db is None:
        db = SessionLocal()
        
    try:
        # Fetch canonical EC measurements
        gt_query = db.query(GroundTruthMeasurement).join(GroundTruthMeasurement.site).filter(
            GroundTruthMeasurement.target_variable == "EC"
        ).order_by(GroundTruthMeasurement.timestamp).all()
        
        if len(gt_query) < 10:
            if synthetic_fallback:
                return _generate_synthetic_data()
            else:
                raise ValueError("Not enough real EC observations for scientific evaluation.")
            
        gt_df = pd.DataFrame([{
            'site_id': gt.site_id,
            'timestamp': pd.to_datetime(gt.timestamp, utc=True).tz_localize(None),
            'value': gt.value,
            'x': gt.site.longitude
        } for gt in gt_query]).sort_values('timestamp')
        
        # Documented time-and-location alignment process:
        # We align EC ground truth with HydroObservations (e.g., water surface elevation)
        # using an AS OF join within a 12-hour tolerance window.
        hydro_query = db.query(HydroObservation).all()
        if hydro_query:
            hydro_df = pd.DataFrame([{
                'site_id': h.site_id,
                'timestamp': pd.to_datetime(h.timestamp, utc=True).tz_localize(None),
                'wse': h.value
            } for h in hydro_query]).sort_values('timestamp')
            
            # Align by site_id and nearest timestamp
            aligned_df = pd.merge_asof(
                gt_df,
                hydro_df,
                by='site_id',
                on='timestamp',
                tolerance=pd.Timedelta('12h'),
                direction='nearest'
            )
            # For demonstration, we keep all GT, but in a strict pipeline we might dropna(subset=['wse'])
            df = aligned_df
        else:
            df = gt_df
            
        # Parse real data
        df['timestamp_sec'] = df['timestamp'].apply(lambda dt: dt.timestamp())
        
        t = torch.tensor(df['timestamp_sec'].values, dtype=torch.float32).view(-1, 1)
        x = torch.tensor(df['x'].values, dtype=torch.float32).view(-1, 1)
        u = torch.tensor(df['value'].values, dtype=torch.float32).view(-1, 1)
        
        # Normalize time to start at 0
        t = t - t.min()
        return x, t, u, False
    finally:
        db.close()

def _generate_synthetic_data(n_samples: int = 100) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, bool]:
    """Generates synthetic salt intrusion data that follows an advection-diffusion pattern."""
    np.random.seed(42)
    # Spatial domain [0, 1], Time domain [0, 1]
    x = np.random.uniform(0, 1, n_samples)
    t = np.sort(np.random.uniform(0, 1, n_samples)) # Sorted time
    
    # Synthetic solution: u(x,t) = exp(-D*t) * sin(pi*x - v*t) + base_salinity
    # Let's use simple sinusoidal wave
    v = 0.5
    D = 0.1
    u = np.exp(-D * t) * np.sin(np.pi * x - v * t) + 1.0 # 1.0 is base salinity
    
    # Add noise
    u += np.random.normal(0, 0.05, n_samples)
    
    x_t = torch.tensor(x, dtype=torch.float32).view(-1, 1)
    t_t = torch.tensor(t, dtype=torch.float32).view(-1, 1)
    u_t = torch.tensor(u, dtype=torch.float32).view(-1, 1)
    
    return x_t, t_t, u_t, True
