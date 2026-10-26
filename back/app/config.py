from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    BOT_TOKEN: str
    DATABASE_URL: str
    ADMIN_IDS: str = ""
    DAILY_CAPACITY: int = 3
    MINI_APP_URL: str
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def admin_ids(self) -> set[int]:
        return {int(x) for x in self.ADMIN_IDS.split(",") if x.strip()}

    @property
    def cors_list(self) -> list[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]


settings = Settings()