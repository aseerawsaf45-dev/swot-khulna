from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "postgresql+psycopg://swot_app:change-me-local-only@localhost:5432/khulna_salt_intrusion"
)

# In a real environment, we'd use async sqlalchemy (ext.asyncio), 
# but synchronous is fine for this prototype slice unless performance dictates otherwise.
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
