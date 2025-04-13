from pydantic import BaseModel

from src.models.node import NodeType


class CreateNodeRequest(BaseModel):
    ip: str
    port: int
    type: NodeType
