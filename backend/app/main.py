from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import Base, engine
from app.routers.trade import router as trade_router
from app.routers.ai_feedback import router as ai_feedback_router
from app.routers.stocks import router as stocks_router
from app.services.stock_search_service import preload

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.on_event("startup")
def startup():
    with engine.connect() as conn:
        conn.execute(text(
            "ALTER TABLE trades ADD COLUMN IF NOT EXISTS market VARCHAR DEFAULT 'NASDAQ'"
        ))
        conn.execute(text("UPDATE trades SET ticker = UPPER(ticker)"))
        conn.execute(text("UPDATE trades SET trade_type = UPPER(trade_type)"))
        conn.execute(text(
            "ALTER TABLE trades ADD COLUMN IF NOT EXISTS trade_date DATE"
        ))
        conn.commit()
    preload()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trade_router)
app.include_router(ai_feedback_router)
app.include_router(stocks_router)