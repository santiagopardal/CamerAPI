from pydantic import BaseModel

from src.models.camera import RecordingStatus, Camera
from src.schemas.video import VideoSchema


class CameraSchema(BaseModel):
    id: int
    name: str
    model: str

    ip: str
    http_port: int
    streaming_port: int

    width: int
    height: int
    framerate: int

    recording_status: RecordingStatus
    sensitivity: int

    videos: list[VideoSchema]

    @classmethod
    def from_model(cls, model: Camera) -> "CameraSchema":
        return cls(
            id=model.id,
            name=model.name,
            model=model.model,
            ip=model.ip,
            http_port=model.http_port,
            streaming_port=model.streaming_port,
            width=model.width,
            height=model.height,
            framerate=model.framerate,
            recording_status=model.recording_status,
            sensitivity=model.sensitivity,
            videos=[VideoSchema.from_model(video) for video in model.videos]
        )