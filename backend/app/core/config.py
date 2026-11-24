from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="SIGNSPEAK_", env_file=ROOT / ".env", extra="ignore"
    )
    environment: Literal["development", "test", "production"] = "development"
    database_url: str = f"sqlite:///{ROOT / 'data' / 'signspeak.sqlite3'}"
    cors_origins: list[str] = []

    @field_validator("cors_origins")
    @classmethod
    def explicit_origins(cls, origins: list[str]) -> list[str]:
        for origin in origins:
            parsed = urlsplit(origin)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.hostname
                or "*" in origin
                or origin != f"{parsed.scheme}://{parsed.netloc}"
                or parsed.username is not None
            ):
                raise ValueError("Expected an explicit HTTP(S) origin")
            _ = parsed.port
        return origins

    @model_validator(mode="after")
    def production_origins(self):
        if self.environment == "production" and any(
            not origin.startswith("https://") for origin in self.cors_origins
        ):
            raise ValueError("Production origins must use HTTPS")
        return self
