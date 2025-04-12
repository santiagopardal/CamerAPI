from contextlib import asynccontextmanager
from functools import lru_cache
from typing import AsyncContextManager

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from src import settings


@lru_cache(maxsize=1)
def get_engine() -> AsyncEngine:
    app_settings = settings.get_settings()
    return create_async_engine(
        app_settings.SQLALCHEMY_DATABASE_URI,
        echo=False,
        future=True,
        pool_size=app_settings.SQLALCHEMY_POOL_SIZE,
        max_overflow=app_settings.SQLALCHEMY_MAX_OVERFLOW,
    )


def get_async_session_maker() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )


@asynccontextmanager  # type: ignore
async def get_session_context_manager() -> AsyncContextManager[AsyncSession]:
    async_session_maker = get_async_session_maker()
    async with async_session_maker() as session:
        yield session


async def get_session():
    async with get_session_context_manager() as session:
        try:
            yield session
            await session.commit()
        except Exception as exception:
            await session.rollback()
            raise exception
        finally:
            await session.close()
