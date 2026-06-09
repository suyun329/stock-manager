from sqlalchemy import create_engine

DATABASE_URL = (
    "postgresql://appadmin:appadmin@localhost:5432/stock_manager"
)

engine = create_engine(DATABASE_URL)

try:
    conn = engine.connect()
    print("DB Connected!")
    conn.close()
except Exception as e:
    print(e)