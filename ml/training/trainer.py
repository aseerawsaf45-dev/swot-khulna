import torch
import torch.optim as optim
import hashlib
import logging
from typing import Dict, Any, Tuple
from ml.models.pinn import PINN
from ml.models.loss import compute_ade_residual, composite_pinn_loss

logger = logging.getLogger(__name__)

class PINNTrainer:
    def __init__(self, model: PINN, lr: float = 1e-3, v: float = 0.5, D: float = 0.1):
        # CPU Fallback guaranteed by checking cuda availability
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = model.to(self.device)
        self.optimizer = optim.Adam(self.model.parameters(), lr=lr)
        self.v = v
        self.D = D
        logger.info(f"Initialized PINNTrainer on device: {self.device}")

    def generate_artifact_checksum(self) -> str:
        """Generate SHA-256 checksum for reproducible metric manifests."""
        state = self.model.state_dict()
        concat_tensors = b"".join([t.cpu().numpy().tobytes() for t in state.values()])
        return hashlib.sha256(concat_tensors).hexdigest()

    def train_step(self, x: torch.Tensor, t: torch.Tensor, u_true: torch.Tensor) -> Tuple[float, float, float]:
        self.model.train()
        self.optimizer.zero_grad()
        
        x = x.to(self.device).requires_grad_(True)
        t = t.to(self.device).requires_grad_(True)
        u_true = u_true.to(self.device)

        # Forward pass
        u_pred = self.model(x, t)
        
        # Calculate PDE residual
        residual = compute_ade_residual(u_pred, x, t, self.v, self.D)
        
        # Calculate composite loss
        loss = composite_pinn_loss(u_pred, u_true, residual)
        
        loss.backward()
        self.optimizer.step()
        
        # Diagnostics
        data_mse = torch.nn.functional.mse_loss(u_pred, u_true).item()
        pde_mse = torch.mean(residual ** 2).item()
        
        return loss.item(), data_mse, pde_mse

    def train(self, x: torch.Tensor, t: torch.Tensor, u_true: torch.Tensor, epochs: int = 100) -> Dict[str, Any]:
        """Runs the training loop and returns diagnostics."""
        history = {"loss": [], "data_loss": [], "pde_loss": []}
        
        for epoch in range(epochs):
            loss, data_loss, pde_loss = self.train_step(x, t, u_true)
            history["loss"].append(loss)
            history["data_loss"].append(data_loss)
            history["pde_loss"].append(pde_loss)
            
            if epoch % 10 == 0 or epoch == epochs - 1:
                logger.info(f"Epoch {epoch} | Total Loss: {loss:.4f} | Data: {data_loss:.4f} | PDE: {pde_loss:.4f}")
                
        checksum = self.generate_artifact_checksum()
        
        return {
            "status": "completed",
            "epochs": epochs,
            "final_loss": history["loss"][-1],
            "checksum": checksum,
            "device_used": str(self.device),
            "history": history
        }
