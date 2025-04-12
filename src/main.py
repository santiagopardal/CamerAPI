from fastapi import FastAPI, APIRouter

from src.nodes.routes import router

app = FastAPI()

main_router = APIRouter(prefix="/api")

main_router.include_router(router)

app.include_router(main_router)