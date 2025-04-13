from fastapi import FastAPI, APIRouter

from src import exceptions
from src.exceptions import api_error, exception_handlers_manager
from src.routes.nodes.routes import router

app = FastAPI()

exception_handlers_manager.register_exception_handlers(app)

main_router = APIRouter(prefix="/api")

main_router.include_router(router)

app.include_router(main_router)