from fastapi import APIRouter

router = APIRouter(prefix="/nodes")

@router.get("/")
async def get_nodes():
    return []