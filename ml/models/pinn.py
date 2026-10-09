import torch
import torch.nn as nn

class FourierFeatureMapping(nn.Module):
    """
    High-frequency coordinate mapping to overcome spectral bias in standard MLPs.
    Crucial for capturing sharp tidal/salinity fronts in the PINN.
    """
    def __init__(self, in_features: int, out_features: int, scale: float = 1.0):
        super().__init__()
        # Ensure out_features is even for sin/cos pairs
        assert out_features % 2 == 0, "out_features must be even for Fourier features"
        self.B = nn.Parameter(torch.randn(in_features, out_features // 2) * scale, requires_grad=False)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x is (batch, in_features)
        x_proj = 2.0 * torch.pi * x @ self.B
        return torch.cat([torch.sin(x_proj), torch.cos(x_proj)], dim=-1)

class PINN(nn.Module):
    """
    Physics-Informed Neural Network architecture.
    Takes spatial (x) and temporal (t) coordinates, and outputs state (u).
    """
    def __init__(self, in_features: int = 2, hidden_dim: int = 64, layers: int = 4, fourier_features: int = 64):
        super().__init__()
        self.fourier_features = fourier_features
        if fourier_features > 0:
            self.mapping = FourierFeatureMapping(in_features, fourier_features, scale=10.0)
            current_dim = fourier_features
        else:
            self.mapping = nn.Identity()
            current_dim = in_features
            
        net_layers = []
        for _ in range(layers):
            net_layers.append(nn.Linear(current_dim, hidden_dim))
            net_layers.append(nn.Tanh())
            current_dim = hidden_dim
            
        # Output is scalar (e.g., salinity or WSE)
        net_layers.append(nn.Linear(hidden_dim, 1)) 
        self.net = nn.Sequential(*net_layers)
        
    def forward(self, x: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        # Concatenate spatial and temporal coordinates
        inputs = torch.cat([x, t], dim=-1)
        mapped = self.mapping(inputs)
        return self.net(mapped)
