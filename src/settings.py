import os
import pathlib
from typing import Generator, Optional, Union
from pydantic import field_validator
from pydantic_core.core_schema import FieldValidationInfo
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)
from sqlalchemy import engine

# Base ROOT of the project. Useful to load assets (like a JSON) making sure we have the right path
# This should point to the location of main.py
BASE_DIR = pathlib.Path(__file__).parent


class Settings(BaseSettings):
    # DB URL
    POSTGRES_HOST: Optional[str] = ""
    POSTGRES_PORT: Optional[int] = 0
    POSTGRES_USER: Optional[str] = ""
    POSTGRES_PASSWORD: Optional[str] = ""
    POSTGRES_DB: Optional[str] = ""
    SQLALCHEMY_DATABASE_URI: Optional[Union[engine.URL, str]] = None
    SQLALCHEMY_POOL_SIZE: int = int(os.environ.get("SQLALCHEMY_POOL_SIZE", 10))
    SQLALCHEMY_MAX_OVERFLOW: int = int(os.environ.get("SQLALCHEMY_MAX_OVERFLOW", 20))

    # Execution info
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    def is_dev(self) -> bool:
        return self.ENVIRONMENT == "development"

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_url(cls, v: Optional[str], values: FieldValidationInfo) -> Union[engine.URL, str]:
        if isinstance(v, str):
            return v
        return engine.URL.create(
            "postgresql+asyncpg",
            username=values.data.get("POSTGRES_USER"),
            password=values.data.get("POSTGRES_PASSWORD"),
            host=values.data.get("POSTGRES_HOST"),
            port=values.data.get("POSTGRES_PORT"),
            database=values.data.get("POSTGRES_DB"),
        )


def create_settings() -> Generator[Settings, None, None]:
    settings = Settings()

    while True:
        yield settings


settings_generator = create_settings()


def get_settings() -> Settings:
    return next(settings_generator)
