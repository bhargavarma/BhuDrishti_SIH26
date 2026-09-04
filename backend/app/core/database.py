from pathlib import Path
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# --------------------------------------------------
# Database location
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

RUNTIME_ROOT = (
    Path("/tmp/intelliland")
    if os.getenv("VERCEL")
    else BASE_DIR
)

DATABASE_DIR = RUNTIME_ROOT / "data"

DATABASE_PATH = DATABASE_DIR / "intelliland.db"


# --------------------------------------------------
# SQLite connection
# --------------------------------------------------

DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


# --------------------------------------------------
# Database session
# --------------------------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# --------------------------------------------------
# Base model
# --------------------------------------------------

Base = declarative_base()


# --------------------------------------------------
# FastAPI database dependency
# --------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()