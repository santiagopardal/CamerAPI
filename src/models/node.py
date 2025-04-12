from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import Integer, orm, DateTime, String, Column, ForeignKey, Table
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped

from src.models.base import Base

if TYPE_CHECKING:
    # Avoid circular imports
    from src.models.video import Video
    from src.models.camera import Camera


camera_node_association_table = Table(
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


class NodeType(StrEnum):
    OBSERVER = "OBSERVER"
    PROCESSOR = "PROCESSOR"


class Node(Base):
    ip: Mapped[str] = orm.mapped_column(String, nullable=False)
    port: Mapped[int] = orm.mapped_column(Integer, nullable=False)
    last_request: Mapped[datetime | None] = orm.mapped_column(DateTime(timezone=True), nullable=False)
    type: Mapped[NodeType] = orm.mapped_column(ENUM(NodeType, create_type=True), nullable=False)

    videos: Mapped[list["Video"]] = orm.relationship("Video", back_populates="node")
    cameras: Mapped[list["Camera"]] = orm.relationship(secondary=camera_node_association_table)
