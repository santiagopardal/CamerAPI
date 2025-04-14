import math
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from starlette import status

from src.daos.camera_dao import CameraDAO
from src.daos.dao import DAO
from src.exceptions.not_found_error import NotFoundError
from src.routes.cameras.requests import CreateCameraRequest
from src.schemas.camera import CameraSchema
from src.schemas.page import Page

router = APIRouter(prefix="/cameras")

@router.get("/")
async def get_cameras(
    camera_dao: Annotated[DAO, Depends(CameraDAO)],
    page_number: int = Query(default=1, gt=0),
    page_size: int = Query(default=10, gt=0),
) -> Page[CameraSchema]:
    return Page(
        items=[
            CameraSchema.from_model(model)
            for model in await camera_dao.list(page_size=page_size, page_number=page_number)
        ],
        page=page_number,
        size=page_size,
        total_pages=math.ceil(await camera_dao.count() / page_size),
    )

@router.get("/{camera_id}")
async def get_camera(camera_id: int, camera_dao: Annotated[DAO, Depends(CameraDAO)]) -> CameraSchema:
    camera = await camera_dao.find(camera_id)

    if camera is None:
        raise NotFoundError(
            object_type="Camera",
            filter_params={"id": camera_id},
        )

    return CameraSchema.from_model(camera)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_camera(camera_info: CreateCameraRequest, camera_dao: Annotated[DAO, Depends(CameraDAO)]) -> CameraSchema:
    model = await camera_dao.create(camera_info)
    return CameraSchema.from_model(model)

@router.put("/{camera_id}")
async def update_camera(camera_id: int, update: CreateCameraRequest, camera_dao: Annotated[DAO, Depends(CameraDAO)]) -> CameraSchema:
    updated = await camera_dao.update(camera_id, update)

    if not updated:
        raise NotFoundError(
            object_type="Camera",
            filter_params={"id": camera_id},
        )

    camera = await camera_dao.find(camera_id)

    return CameraSchema.from_model(camera)


@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera(camera_id: int, camera_dao: Annotated[DAO, Depends(CameraDAO)]):
    deleted = await camera_dao.delete(camera_id)

    if not deleted:
        raise NotFoundError(
            object_type="Camera",
            filter_params={"id": camera_id},
        )
