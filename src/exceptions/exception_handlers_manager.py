"""Exception handlers manager."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from typing import Type, Callable, Any, Tuple

from src.exceptions import api_error
from src.exceptions.api_error import APIError

HANDLERS: list[Tuple[Type[Exception], Callable[[Request, Any], JSONResponse]]] = [
    (APIError, api_error.api_exception_handler)
]


def register_exception_handlers(app: FastAPI):
    """Registers exception handlers for the given FastAPI.

    Args:
        app: The FastAPI app.
    """
    for exception_type, handler in HANDLERS:
        app.add_exception_handler(exception_type, handler)  # type: ignore
