from sqlalchemy.orm import Session

from app.models.trade import Trade
from app.schemas.trade import TradeCreate

def update_trade(db: Session, trade_id: int, trade_data: TradeCreate):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()

    if not trade:
        return None

    trade.ticker = trade_data.ticker
    trade.quantity = trade_data.quantity
    trade.price = trade_data.price
    trade.trade_type = trade_data.trade_type
    trade.market = trade_data.market
    trade.trade_date = trade_data.trade_date

    db.commit()
    db.refresh(trade)

    return trade

def delete_trade(db: Session, trade_id: int):
    trade = (
        db.query(Trade)
        .filter(Trade.id == trade_id)
        .first()
    )

    if not trade:
        return None

    db.delete(trade)
    db.commit()

    return {"message": "Trade deleted successfully"}