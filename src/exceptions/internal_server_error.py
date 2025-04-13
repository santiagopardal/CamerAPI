"""Internal server error exception."""

from dataclasses import dataclass

from fastapi import status

from src.exceptions.api_error import APIError, RetryInfo


@dataclass(kw_only=True)
class InternalServerError(APIError):
    """Internal Server Error."""

    def status_code(self) -> int:
        """Status code for the response.

        Returns:
            The status code for the response.
        """
        return status.HTTP_500_INTERNAL_SERVER_ERROR

    @property
    def error_type(self) -> str:
        """Type of the error.

        Returns:
            String: the type of the error.
        """
        return "INTERNAL_SERVER_ERROR"

    @property
    def retry_info(self) -> RetryInfo:
        """Information about the retries.

        Returns:
            RetryInfo
        """
        return RetryInfo(is_retriable=False)
