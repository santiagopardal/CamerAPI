"""APIError."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional

from fastapi import Request
from fastapi.responses import JSONResponse

from src.schemas.api_error_model import APIErrorModel, RetryInfo


@dataclass(kw_only=True)
class APIError(Exception, ABC):
    """API Call error message."""

    user_message: Optional[str] = None
    """A user-friendly error message."""

    @abstractmethod
    def status_code(self) -> int:
        """Status code for the response.

        Returns:
            The status code for the response.
        """

    @property
    @abstractmethod
    def error_type(self) -> str:
        """Type of the error.

        Returns:
            String: the type of the error.
        """

    @property
    def retry_info(self) -> RetryInfo:
        """Information about the retries.

        Returns:
            RetryInfo
        """
        return RetryInfo(is_retriable=False)

    @property
    def error_details(self) -> Optional[dict[str, Any]]:
        """More details about the error.

        Returns:
            A dictionary with more information about the error if applicable.
        """
        return None


def api_exception_handler(_: Request, exception: APIError) -> JSONResponse:
    """Gracefully handles a APIError and returns a response with the expected format.

    Args:
        _: Request
        exception: APIError

    Returns:
        JSONResponse
    """
    api_error = APIErrorModel(
        error_type=exception.error_type,
        retry_info=exception.retry_info,
        user_message=exception.user_message,
        error_details=exception.error_details,
    )

    return JSONResponse(content=api_error.model_dump(), status_code=exception.status_code())
