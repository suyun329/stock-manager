from fastapi import FastAPI
from fastapi import Depends

from sqlalchemy.orm import Session

from app.core.database import Base
from app.core.database import engine

from app.core.deps import get_db

from app.routers.trade import router as trade_router
from app.routers.ai_feedback import router as ai_feedback_router

Base.metadata.create_all(bind=engine) # 테이블 생성

app = FastAPI()

app.include_router(trade_router) # trade_router의 경로를 app에 포함시킴 (router/trade.py 안에 있는 API들을 FastAPI 앱에 등록해라)
# app.include_router() 함수를 사용하여 trade_router를 FastAPI 앱에 포함시킴으로써, trade_router 안에 정의된 API 엔드포인트들이 FastAPI 앱에서 사용할 수 있게 됨.
app.include_router(ai_feedback_router)