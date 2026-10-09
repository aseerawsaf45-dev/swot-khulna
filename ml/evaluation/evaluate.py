import json
import torch
import numpy as np
import pandas as pd
from ml.data.loader import load_aligned_data
from ml.models.pinn import PINN
from ml.training.trainer import PINNTrainer
from ml.models.baseline import PersistenceBaseline, evaluate_metrics
from services.api.app.db.session import SessionLocal

def run_evaluation(db=None, force_synthetic=False):
    """
    Chronologically splits data, trains PINN, tests against persistence baseline,
    and returns metric manifest.
    """
    x_full, t_full, u_full, is_synthetic = load_aligned_data(db=db, synthetic_fallback=force_synthetic)
    
    # Chronological split (80/20)
    n_samples = len(t_full)
    split_idx = int(n_samples * 0.8)
    
    # We must ensure t is sorted for a strict chronological split
    t_np = t_full.numpy().flatten()
    sorted_indices = np.argsort(t_np)
    
    x_full = x_full[sorted_indices]
    t_full = t_full[sorted_indices]
    u_full = u_full[sorted_indices]
    
    x_train, t_train, u_train = x_full[:split_idx], t_full[:split_idx], u_full[:split_idx]
    x_test, t_test, u_test = x_full[split_idx:], t_full[split_idx:], u_full[split_idx:]
    
    # Train PINN
    pinn_model = PINN()
    trainer = PINNTrainer(model=pinn_model, lr=0.01)
    
    # Use deterministic seed for reproducibility
    torch.manual_seed(42)
    train_history = trainer.train(x_train, t_train, u_train, epochs=200)
    
    # Evaluate PINN
    trainer.model.eval()
    with torch.no_grad():
        u_pred_tensor = trainer.model(x_test.to(trainer.device), t_test.to(trainer.device))
        u_pred = u_pred_tensor.cpu().numpy().flatten()
        
    y_true = u_test.numpy().flatten()
    
    pinn_metrics = evaluate_metrics(y_true, u_pred)
    
    # Evaluate Persistence Baseline
    baseline = PersistenceBaseline()
    # History is the training set's ground truth, horizon is length of test set
    u_train_series = pd.Series(u_train.numpy().flatten())
    baseline_pred = baseline.predict(u_train_series, horizon=len(y_true))
    
    baseline_metrics = evaluate_metrics(y_true, baseline_pred)
    
    manifest = {
        "samples": n_samples,
        "train_samples": len(u_train),
        "test_samples": len(u_test),
        "is_synthetic": is_synthetic,
        "pinn_mae": pinn_metrics["mae"],
        "pinn_rmse": pinn_metrics["rmse"],
        "baseline_mae": baseline_metrics["mae"],
        "baseline_rmse": baseline_metrics["rmse"],
        "pinn_wins": pinn_metrics["mae"] < baseline_metrics["mae"],
        "pinn_checksum": train_history["checksum"]
    }
    
    # Persist manifest to disk so dashboard can read it
    import os
    artifact_dir = os.path.join(os.path.dirname(__file__), "..", "..", "apps", "web", "public")
    os.makedirs(artifact_dir, exist_ok=True)
    with open(os.path.join(artifact_dir, "evaluation_manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
        
    return manifest

if __name__ == "__main__":
    db = SessionLocal()
    manifest = run_evaluation(db, force_synthetic=False)
    print(json.dumps(manifest, indent=2))
