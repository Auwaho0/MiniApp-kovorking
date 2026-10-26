from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine
from .models import Base
from .routers import bookings, notify, waitlist


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

app.include_router(bookings.router, prefix="/api")
app.include_router(waitlist.router, prefix="/api")
app.include_router(notify.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"ok": True}