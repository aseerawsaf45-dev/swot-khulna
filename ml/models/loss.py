import torch

def compute_ade_residual(u: torch.Tensor, x: torch.Tensor, t: torch.Tensor, v: float, D: float) -> torch.Tensor:
    """
    Computes the residual of the 1D Advection-Dispersion Equation (ADE):
    ∂u/∂t + v ∂u/∂x - D ∂²u/∂x² = 0
    
    *NOTE:* The exact formulation and boundary conditions should be verified 
    with a hydrological domain expert for specific Khulna estuarine conditions.
    
    Args:
        u: Output state tensor (batch, 1), requires_grad=True
        x: Spatial coordinates (batch, 1), requires_grad=True
        t: Time coordinates (batch, 1), requires_grad=True
        v: Advection velocity (constant or learnable tensor)
        D: Dispersion coefficient (constant or learnable tensor)
    """
    # 1st order derivatives (autograd tracks operations to build graph)
    du_dt = torch.autograd.grad(u, t, grad_outputs=torch.ones_like(u), create_graph=True)[0]
    du_dx = torch.autograd.grad(u, x, grad_outputs=torch.ones_like(u), create_graph=True)[0]
    
    # 2nd order spatial derivative
    d2u_dx2 = torch.autograd.grad(du_dx, x, grad_outputs=torch.ones_like(du_dx), create_graph=True)[0]
    
    # ADE residual: forced to 0 during PINN training
    residual = du_dt + v * du_dx - D * d2u_dx2
    return residual

def composite_pinn_loss(
    u_pred: torch.Tensor, 
    u_true: torch.Tensor, 
    residual: torch.Tensor, 
    lambda_data: float = 1.0, 
    lambda_pde: float = 1.0
) -> torch.Tensor:
    """
    Composite loss weighting the data mismatch (MSE) and PDE physics residual.
    """
    data_loss = torch.nn.functional.mse_loss(u_pred, u_true)
    pde_loss = torch.mean(residual ** 2)
    return lambda_data * data_loss + lambda_pde * pde_loss
