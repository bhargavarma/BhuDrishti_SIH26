from .database import DATABASE_DIR, Base, engine
from ..models.land_record import LandRecord


def init_database():
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    print("IntelliLand AI database initialized successfully.")


if __name__ == "__main__":
    init_database()