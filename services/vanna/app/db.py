import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def run_query(sql: str):
    """Executes the given SQL query and returns results as a list of dicts."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            cols = result.keys()
            rows = [dict(zip(cols, row)) for row in result.fetchall()]
        return rows
    except SQLAlchemyError as e:
        raise RuntimeError(str(e.orig))
