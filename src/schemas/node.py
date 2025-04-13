from datetime import datetime

from pydantic import BaseModel

from src.models.node import NodeType, Node


class NodeSchema(BaseModel):
    id: int
    ip: str
    port: int
    last_request: datetime | None
    type: NodeType

    # videos: list["Video"] = orm.relationship("Video", back_populates="node")
    # cameras: Mapped[list["Camera"]] = orm.relationship(secondary=camera_node_association.table)

    @classmethod
    def from_model(cls, model: Node) -> "NodeSchema":
        return cls(
            id=model.id,
            ip=model.ip,
            port=model.port,
            last_request=model.last_request,
            type=model.type,
        )