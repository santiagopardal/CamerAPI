"""Not found exception."""

from dataclasses import dataclass
from typing import Any, Optional

from fastapi import status

from src.exceptions.api_error import APIError, RetryInfo


@dataclass(kw_only=True)
class NotFoundError(APIError):
    """Not found exception."""

    object_type: str
    """The type of the object that couldn't be found."""
    filter_params: dict
    """The filters that were applied to the search."""

    def status_code(self) -> int:
        """Status code for the response.

        Returns:
            The status code for the response.
        """
        return status.HTTP_404_NOT_FOUND

    @property
    def error_type(self) -> str:
        """Type of the error.

        Returns:
            String: the type of the error.
        """
        return "NOT_FOUND"

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
        return {"object_type": self.object_type, "filter_params": self.filter_params}
