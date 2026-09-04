from backend.app.core.database import Base, engine
from backend.app.models.land_record import LandRecord


def init_database():
    Base.metadata.create_all(bind=engine)
    print("IntelliLand AI database initialized successfully.")


if __name__ == "__main__":
    init_database()