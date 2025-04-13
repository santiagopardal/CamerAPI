import types
from abc import ABC
from dataclasses import dataclass
from typing import Annotated, TypeVar

from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy import func, Select, orm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, class_mapper

from src.db import db
from src.models import Base

T = TypeVar("T")


@dataclass
class DAO[T: Base](ABC):
    session: Annotated[AsyncSession, Depends(db.get_session)]

    @property
    def model_type(self) -> type[T]:
        return types.get_original_bases(self.__class__)[0].__args__[0]

    def attribute_names(self) -> list[str]:
        return [
            prop.key
            for prop in class_mapper(self.model_type).iterate_properties
        ]

    def column_names(self) -> list[str]:
        return [
            prop.key
            for prop in class_mapper(self.model_type).iterate_properties
            if isinstance(prop, orm.ColumnProperty)
        ]

    async def create(self, model_data: BaseModel) -> T:
        model = self.model_type(**model_data.model_dump())

        self.session.add(model)

        await self.session.commit()
        await self.session.refresh(model, self.attribute_names())

        return model

    async def list(self, page_size: int, page_number: int) -> list[T]:
        query = (
            Select(
                self.model_type
            ).options(
                selectinload("*")
            )
            .offset(
                (page_number - 1) * page_size
            ).order_by(
                self.model_type.id.asc()
            ).limit(
                page_size
            )
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
