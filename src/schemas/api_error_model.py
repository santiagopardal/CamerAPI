"""API Error."""

import enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class RetryStrategy(enum.StrEnum):
    """Enum representing the types of retry strategies."""

    EXPONENTIAL_BACKOFF = "EXPONENTIAL_BACKOFF"
    MULTIPLICATIVE_BACKOFF = "MULTIPLICATIVE_BACKOFF"


class RetryInfo(BaseModel):
    """Retry information."""

    is_retriable: bool = Field(
        default=False, description="Indicates if the API call can be retried."
    )
    retry_strategy: Optional[RetryStrategy] = Field(
        default=None, description="The retry strategy if the call can be retried."
    )
    minimum_time_to_wait_in_seconds: Optional[int] = Field(
        default=None, description="Minimum time to wait before retrying, in seconds."
    )


class APIErrorModel(BaseModel):
    """API Error model."""

    error_type: str = Field(description="The descriptive error code on why the API call failed.")
    retry_info: RetryInfo = Field(description="Information about the retries.")
    user_message: Optional[str] = Field(default=None, description="A user-friendly error message.")
    error_details: Optional[dict[str, Any]] = Field(
        default=None, description="More details about the error."
    )
