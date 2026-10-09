from fastapi import APIRouter
from .endpoints import data_hub, reaches, predict

api_router = APIRouter()
api_router.include_router(reaches.router, prefix="/reaches", tags=["reaches"])
api_router.include_router(data_hub.router, prefix="/data", tags=["data_hub"])
api_router.include_router(predict.router, prefix="/predict", tags=["predict"])
