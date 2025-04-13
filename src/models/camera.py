from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import Integer, orm, String
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped

from src.models import camera_node_association

from src.models.base import Base

if TYPE_CHECKING:
    # Avoid circular imports
    from src.models.video import Video
    from src.models import Node


class RecordingStatus(StrEnum):
    RECORDING = "RECORDING"
    NOT_RECORDING = "NOT_RECORDING"


class Camera(Base):
    name: Mapped[str] = orm.mapped_column(String, nullable=False)
    model: Mapped[str] = orm.mapped_column(String, nullable=False)

    ip: Mapped[str] = orm.mapped_column(String, nullable=False)
    http_port: Mapped[int] = orm.mapped_column(Integer, nullable=True)
    streaming_port: Mapped[int] = orm.mapped_column(Integer, nullable=False)

    user: Mapped[str] = orm.mapped_column(String, nullable=False)
    password: Mapped[str] = orm.mapped_column(String, nullable=False)

    width: Mapped[int] = orm.mapped_column(Integer, nullable=False)
    height: Mapped[int] = orm.mapped_column(Integer, nullable=False)
    framerate: Mapped[int] = orm.mapped_column(Integer, nullable=False)

    recording_status: Mapped[RecordingStatus] = orm.mapped_column(ENUM(RecordingStatus, create_type=True), nullable=False)
    sensitivity: Mapped[int] = orm.mapped_column(Integer, nullable=False)

    videos: Mapped[list["Video"]] = orm.relationship("Video", back_populates="camera")
    nodes: Mapped[list["Node"]] = orm.relationship(secondary=camera_node_association.table)
