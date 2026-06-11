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
    total_buy_amount = 0 # 총 구매 금액
    total_buy_quantity = 0 # 총 구매 수량

    for trade in trades:
        if trade.trade_type.upper() == "BUY":
            buy_qty += trade.quantity
            
            total_buy_quantity += trade.quantity
            total_buy_amount += trade.quantity * trade.price # 총 거래 금액

        elif trade.trade_type.upper() == "SELL":
            sell_qty += trade.quantity

    avg_buy_price = (
        total_buy_amount / total_buy_quantity
        if total_buy_quantity > 0
        else 0
    )

    invested_amount = total_buy_amount


    return {
        "ticker": ticker,
        "quantity": buy_qty - sell_qty,
        "avg_buy_price": round(avg_buy_price, 2),
        "invested_amount": round(invested_amount, 2),
        # "avg_buy_price(평균 단가)"
        # "invested_amount(투자 원금)
    }