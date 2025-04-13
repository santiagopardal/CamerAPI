from fastapi import FastAPI, APIRouter

from src.exceptions import exception_handlers_manager
from src.routes.nodes.routes import router as node_router
from src.routes.cameras.routes import router as camera_router

app = FastAPI()

exception_handlers_manager.register_exception_handlers(app)

main_router = APIRouter(prefix="/api")

main_router.include_router(node_router)
main_router.include_router(camera_router)

app.include_router(main_router)