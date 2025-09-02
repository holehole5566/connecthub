import psycopg2
from psycopg2.extras import RealDictCursor
import os
from contextlib import contextmanager

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://connecthub_user:your_password_here@localhost:5432/connecthub_db")

@contextmanager
def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()