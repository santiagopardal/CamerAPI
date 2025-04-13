from sqlalchemy import Column, Integer, ForeignKey, Table

from src.models import Base

table = Table(
    "camera_node_association",
    Base.metadata,
    Column(
        "node_id",
        Integer,
        ForeignKey("node.id"),
        primary_key=True,
        index=True,
    ),
    Column(
        "camera_id",
        Integer,
        ForeignKey("camera.id"),
        primary_key=True,
        index=True,
    ),
)
