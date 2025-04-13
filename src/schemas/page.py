from typing import TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class Page[T: BaseModel](BaseModel):
    page: int
    size: int
    items: list[T]
    total_pages: int
