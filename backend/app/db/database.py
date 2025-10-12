from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database connection URL (adjust user/pass/host/db if needed)
DB_URL = "mysql+pymysql://root:root@localhost/network_scanner"

# Create engine
engine = create_engine(
    DB_URL,
    pool_pre_ping=True,   # ensures stale connections are recycled
    pool_recycle=3600,    # refresh connections every hour
    echo=False            # set True for SQL debug logging
)

# Session factory (if you need ORM sessions)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency for FastAPI routes (if you use Depends)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
