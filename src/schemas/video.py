import datetime

from pydantic import BaseModel

from src.models.video import VideoType


class VideoSchema(BaseModel):
    id: int
    path: str
    date: datetime.date
    type: VideoType
