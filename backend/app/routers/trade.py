from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.core.deps import get_db

from app.models.trade import Trade
from app.schemas.trade import TradeCreate

router = APIRouter()

@router.post("/trades")
def create_trade(
    trade: TradeCreate,
    db: Session = Depends(get_db)
):
    trade_db = Trade( # 객체 생성
        ticker=trade.ticker,
        trade_type=trade.trade_type,
        quantity=trade.quantity,
        price=trade.price
    )

    db.add(trade_db) # db 저장 준비
    db.commit() # db에 저장
    db.refresh(trade_db) # db에 저장된 객체를 새로고침하여 id 값을 가져옴

    return trade_db

@router.get("/trades")
def get_trades(
    db: Session = Depends(get_db)
):
    return db.query(Trade).all()

@router.get("/portfolio/{ticker}")
def get_portfolio(
    ticker: str,
    db: Session = Depends(get_db)
):
    trades =(
        db.query(Trade)
        .filter(Trade.ticker == ticker)
        .all()
    )

    holding_quantity = 0

    for trade in trades:
        if trade.trade_type.upper() == "BUY":
            holding_quantity += trade.quantity
        elif trade.trade_type.upper() == "SELL":
            holding_quantity -= trade.quantity

    return {
        "ticker": ticker,
        "holding_quantity": holding_quantity
    }



