from datetime import datetime
import re
from sqlalchemy import DateTime, Integer, orm
from sqlalchemy.orm import Mapped, DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncAttrs


class Base(AsyncAttrs, DeclarativeBase):
    id: Mapped[int] = orm.mapped_column(Integer, autoincrement=True, primary_key=True, index=True, nullable=False)

    created_at: Mapped[datetime] = orm.mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = orm.mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    __name__: str

    @orm.declared_attr
    def __tablename__(cls) -> str:
        def pascal_to_snake(pascal_str):
            snake_str = re.sub(r'(?<!^)(?=[A-Z])', '_', pascal_str).lower()
            return snake_str

        return pascal_to_snake(cls.__name__)
