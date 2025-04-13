import types
from abc import ABC
from dataclasses import dataclass
from typing import Annotated, TypeVar

from fastapi import Depends
from sqlalchemy import func, Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.db import db
from src.models import Base

T = TypeVar("T")


@dataclass
class DAO[T: Base](ABC):
    session: Annotated[AsyncSession, Depends(db.get_session)]

    @property
    def model_type(self) -> T:
        return types.get_original_bases(self.__class__)[0].__args__[0]

    async def list(self, page_size: int, page_number: int) -> list[T]:
        query = Select(
            self.model_type
        ).offset(
            (page_number - 1) * page_size
        ).order_by(
            self.model_type.id.desc()
        ).limit(
            page_size
        )

        result = await self.session.execute(query)

        return list(result.scalars().all())

    async def find(self, object_id: int) -> T | None:
        return await self.session.get(
            self.model_type,
            object_id,
            options=[selectinload("*")],
        )

    async def count(self) -> int:
        query = func.count(self.model_type.id)

        result = await self.session.execute(query)

        return result.scalar()
