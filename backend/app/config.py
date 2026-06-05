import json
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List

_PLACEHOLDER = "change-this-to-a-random-string-of-at-least-32-characters"


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    admin_password: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    upload_dir: str = "uploads"

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if v == _PLACEHOLDER or len(v) < 32:
            raise ValueError("SECRET_KEY must be set to a random string of at least 32 characters")
        return v

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, ValueError):
                pass
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
