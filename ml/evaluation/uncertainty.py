import numpy as np
import pandas as pd
from typing import Dict

def compute_calibration_score(y_true: np.ndarray, y_pred_mean: np.ndarray, y_pred_std: np.ndarray, confidence_level: float = 0.95) -> float:
    """
    Evaluates uncertainty calibration. Returns the empirical coverage percentage.
    If the model's uncertainty bounds are perfectly calibrated, the empirical coverage 
    will equal the confidence_level (e.g., 95%).
    """
    from scipy.stats import norm
    
    z_score = norm.ppf((1 + confidence_level) / 2)
    lower_bound = y_pred_mean - z_score * y_pred_std
    upper_bound = y_pred_mean + z_score * y_pred_std
    
    # Calculate percentage of true observations falling within the predicted confidence interval
    within_bounds = (y_true >= lower_bound) & (y_true <= upper_bound)
    empirical_coverage = np.mean(within_bounds)
    
    return float(empirical_coverage)

def evaluate_reliability_by_lead_time(
    y_true: np.ndarray, 
    y_pred_mean: np.ndarray, 
    y_pred_std: np.ndarray, 
    lead_times: np.ndarray
) -> Dict[int, float]:
    """
    Calculates calibration score stratified by forecast lead time (e.g., day 1 to day 14).
    As lead time increases, prediction intervals should naturally widen to maintain coverage.
    """
    unique_leads = np.unique(lead_times)
    reliability_report = {}
    
    for lead in unique_leads:
        mask = lead_times == lead
        if np.sum(mask) > 0:
            coverage = compute_calibration_score(y_true[mask], y_pred_mean[mask], y_pred_std[mask])
            reliability_report[int(lead)] = coverage
            
    return reliability_report

def evaluate_seasonal_reliability(
    df: pd.DataFrame, 
    true_col: str = 'y_true', 
    pred_col: str = 'y_pred', 
    std_col: str = 'y_std', 
    date_col: str = 'timestamp'
) -> Dict[str, float]:
    """
    Stratifies uncertainty calibration by Khulna's distinct hydrological seasons:
    - Monsoon / High Flow (June - October)
    - Dry / Saline Intrusion (November - May)
    """
    df['month'] = pd.to_datetime(df[date_col]).dt.month
    
    monsoon_mask = df['month'].isin([6, 7, 8, 9, 10])
    dry_mask = ~monsoon_mask
    
    report = {}
    
    if monsoon_mask.sum() > 0:
        report['monsoon_coverage'] = compute_calibration_score(
            df.loc[monsoon_mask, true_col].values,
            df.loc[monsoon_mask, pred_col].values,
            df.loc[monsoon_mask, std_col].values
        )
        
    if dry_mask.sum() > 0:
        report['dry_coverage'] = compute_calibration_score(
            df.loc[dry_mask, true_col].values,
            df.loc[dry_mask, pred_col].values,
            df.loc[dry_mask, std_col].values
        )
        
    return report
