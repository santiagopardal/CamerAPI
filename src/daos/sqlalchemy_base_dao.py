import types
from dataclasses import dataclass
from typing import Annotated, TypeVar

from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy import func, Select, orm, Update, Delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, class_mapper, MapperProperty

from src.daos.dao import DAO
from src.db import db
from src.models import Base

T = TypeVar("T")


@dataclass
class SQLAlchemyBaseDAO[T: Base](DAO[T]):
    session: Annotated[AsyncSession, Depends(db.get_session)]

    @property
    def model_type(self) -> type[T]:
        return types.get_original_bases(self.__class__)[0].__args__[0]

    def model_properties(self) -> set[MapperProperty]:
        return {
            prop
            for prop in class_mapper(self.model_type).iterate_properties
            if prop.key not in {"id", "created_at", "updated_at"}
        }

    def attribute_names(self) -> set[str]:
        return {prop.key for prop in self.model_properties()}

    def columns_names(self) -> set[str]:
        return {
            prop.key
            for prop in self.model_properties()
            if isinstance(prop, orm.ColumnProperty)
        }

    async def create(self, model_data: BaseModel) -> T:
        model = self.model_type(**model_data.model_dump())

        self.session.add(model)

        await self.session.commit()
        await self.session.refresh(model, self.attribute_names())

        return model

    async def update(self, object_id: int, model_data: BaseModel) -> bool:
        columns_names = self.columns_names()

        update_query = Update(
            self.model_type
        ).where(
            self.model_type.id == object_id
        ).values(
            **{
                key: value
                for key, value in model_data.model_dump().items()
                if key in columns_names
            }
        )

        result = await self.session.execute(update_query)
        await self.session.commit()

        return result.rowcount == 1

    async def delete(self, object_id: int) -> bool:
        query = Delete(self.model_type).where(self.model_type.id == object_id)

        result = await self.session.execute(query)
        await self.session.commit()

        return result.rowcount == 1

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
