import math
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from src.daos.node_dao import NodeDAO
from src.exceptions.not_found_error import NotFoundError
from src.schemas.node import NodeSchema
from src.schemas.page import Page

router = APIRouter(prefix="/nodes")

@router.get("/")
async def get_nodes(
    node_dao: Annotated[NodeDAO, Depends(NodeDAO)],
    page_number: int = Query(default=1, gt=0),
    page_size: int = Query(default=10, gt=0),
) -> Page[NodeSchema]:
    return Page(
        items=[
            NodeSchema.from_model(model)
            for model in await node_dao.list(page_size=page_size, page_number=page_number)
        ],
        page=page_number,
        size=page_size,
        total_pages=math.ceil(await node_dao.count() / page_size),
    )

@router.get("/{node_id}")
async def get_node(node_id: int, node_dao: Annotated[NodeDAO, Depends(NodeDAO)]) -> NodeSchema:
    node = await node_dao.find(node_id)

    if node is None:
        raise NotFoundError(
            object_type="Node",
            filter_params={"id": node_id},
        )

    return NodeSchema.from_model(node)