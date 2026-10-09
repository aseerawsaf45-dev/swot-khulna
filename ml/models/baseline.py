import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error
from typing import Dict

class PersistenceBaseline:
    """Predicts that the future value will be exactly the last observed value."""
    def predict(self, history: pd.Series, horizon: int) -> np.ndarray:
        last_val = history.iloc[-1] if len(history) > 0 else 0.0
        return np.full(horizon, last_val)

class StatisticalBaseline:
    """Simple linear regression over the recent time window."""
    def __init__(self):
        self.model = LinearRegression()

    def fit(self, history_time: np.ndarray, history_values: np.ndarray):
        if len(history_time) > 1:
            self.model.fit(history_time.reshape(-1, 1), history_values)
        
    def predict(self, future_time: np.ndarray) -> np.ndarray:
        try:
            return self.model.predict(future_time.reshape(-1, 1))
        except:
            return np.zeros(len(future_time))

def evaluate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Reproducible metric manifest."""
    return {
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "samples": len(y_true)
    }
