from sqlalchemy.orm import Session

from app.models.trade import Trade

def calculate_portfolio(db: Session, ticker: str):
    trades = (
        db.query(Trade)
        .filter(Trade.ticker == ticker)
        .all()
    )

    buy_qty = 0
    sell_qty = 0

    for trade in trades:
        if trade.trade_type.upper() == "BUY":
            buy_qty += trade.quantity
        elif trade.trade_type.upper() == "SELL":
            sell_qty += trade.quantity

    return {
        "ticker": ticker,
        "quantity": buy_qty - sell_qty
    }