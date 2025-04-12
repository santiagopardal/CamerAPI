from datetime import date
from enum import StrEnum

from sqlalchemy import orm, String, Date, ForeignKey
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped

from src.models.base import Base
from src.models.camera import Camera
from src.models.node import Node


class VideoType(StrEnum):
    FINAL = "FINAL"
    TEMPORARY = "TEMPORARY"


class Video(Base):
    path: Mapped[str] = orm.mapped_column(String, nullable=False)
    date: Mapped[date] = orm.mapped_column(Date, nullable=False)

    type: Mapped[VideoType] = orm.mapped_column(ENUM(VideoType, create_type=True), nullable=False)

    camera_id: Mapped[int] = orm.mapped_column(ForeignKey("camera.id"), index=True, nullable=True)
    camera: Mapped[Camera] = orm.relationship("Camera", back_populates="videos")

    node_id: Mapped[int] = orm.mapped_column(
        ForeignKey("node.id"), index=True, nullable=True
    )
    node: Mapped[Node] = orm.relationship("Node", back_populates="videos")
