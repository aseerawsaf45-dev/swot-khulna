import torch
import pytest
from ml.models.pinn import PINN
from ml.models.loss import compute_ade_residual

def test_pinn_forward_pass():
    """Verify that the Physics-Informed Neural Network executes a forward pass successfully."""
    model = PINN(in_features=2, hidden_dim=16, layers=2, fourier_features=8)
    
    # Simulating a batch of 5 coordinates (x, t)
    x = torch.rand(5, 1)
    t = torch.rand(5, 1)
    
    output = model(x, t)
    assert output.shape == (5, 1), "PINN should output a scalar prediction for each spatial-temporal input."

def test_ade_residual():
    """Verify that the Advection-Dispersion Equation residual calculation completes without autograd errors."""
    x = torch.rand(5, 1, requires_grad=True)
    t = torch.rand(5, 1, requires_grad=True)
    
    # Dummy nonlinear prediction
    u = x**2 + t
    
    residual = compute_ade_residual(u, x, t, v=0.5, D=0.1)
    assert residual.shape == (5, 1), "Residual should map 1:1 with the batch shape."
