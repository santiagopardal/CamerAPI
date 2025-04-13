from datetime import datetime

from pydantic import BaseModel

from src.models.node import NodeType, Node
from src.schemas.camera import CameraSchema
from src.schemas.video import VideoSchema


class NodeSchema(BaseModel):
    id: int
    ip: str
    port: int
    last_request: datetime | None
    type: NodeType

    cameras: list[CameraSchema]

    @classmethod
    def from_model(cls, model: Node) -> "NodeSchema":
        return cls(
            id=model.id,
            ip=model.ip,
            port=model.port,
            last_request=model.last_request,
            type=model.type,
            cameras=[CameraSchema.from_model(camera_model) for camera_model in model.cameras],
        )