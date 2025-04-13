
from pydantic import BaseModel, field_validator

from src.models.camera import RecordingStatus


class CreateCameraRequest(BaseModel):
    name: str
    model: str

    ip: str
    http_port: int
    streaming_port: int

    user: str
    password: str

    width: int
    height: int
    framerate: int

    recording_status: RecordingStatus
    sensitivity: int

    @field_validator("sensitivity", mode="before")
    @classmethod
    def validate_sensitivity(cls, value: int | float) -> int:
        if isinstance(value, float):
            value = int(value * 100)

        assert 0 <= value <= 100, "Sensitivity must be between 0 and 100 or a float between 0 and 1"

        return value

