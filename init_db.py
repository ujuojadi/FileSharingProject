"""Database initialization script using app.db and app.models"""
import asyncio
from app import db as app_db
from app.models import Base as AppBase


async def init_db():
    # Create all tables (drop then create) on the configured database
    engine = app_db.engine
    async with engine.begin() as conn:
        await conn.run_sync(AppBase.metadata.drop_all)
        await conn.run_sync(AppBase.metadata.create_all)
    await engine.dispose()


def init():
    asyncio.run(init_db())


if __name__ == "__main__":
    init()