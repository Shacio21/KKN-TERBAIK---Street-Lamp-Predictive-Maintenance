from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "PJU IoT Monitoring API"
    environment: str = "development"
    secret_key: str = Field(default="change-me")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30
    database_url: str = "postgresql+asyncpg://pju:pju@localhost:5432/pju_monitoring"
    redis_url: str = "redis://localhost:6379/0"
    mqtt_host: str = "localhost"
    mqtt_port: int = 1883
    mqtt_username: str | None = None
    mqtt_password: str | None = None
    mqtt_base_topic: str = "pju/#"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    first_admin_email: str | None = None
    first_admin_password: str | None = None
    first_admin_name: str = "Administrator"
    upload_dir: str = "uploads"

    # SMTP email settings (optional - logs to console if not configured)
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "noreply@pju-monitor.id"
    smtp_from_name: str = "PJU Monitor"

    # Rate limiting
    rate_limit_login: str = "10/minute"
    rate_limit_register: str = "5/hour"

    # Frontend URL (for email links)
    frontend_url: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
