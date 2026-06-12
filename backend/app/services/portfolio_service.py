from sqlalchemy.orm import Session

from app.models.trade import Trade
from app.services.price_service import get_current_price

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
    current_price = get_current_price(ticker)

    for trade in trades:
        if trade.trade_type.upper() == "BUY":
            buy_qty += trade.quantity
            
            total_buy_quantity += trade.quantity
            total_buy_amount += trade.quantity * trade.price # 총 거래 금액

        elif trade.trade_type.upper() == "SELL":
            sell_qty += trade.quantity

    quantity = buy_qty - sell_qty

    avg_buy_price = (
        total_buy_amount / total_buy_quantity
        if total_buy_quantity > 0
        else 0
    )

    invested_amount = total_buy_amount
    current_value = quantity * current_price # 평가 금액
    profit_loss = current_value - invested_amount # 손익 계산
    profit_rate = ( # 수익률 계산
        (profit_loss / invested_amount) * 100
        if invested_amount > 0 # 존재하지 않는 거래 조회 시 예외처리
        else 0
    )


    return {
        "ticker": ticker,
        "quantity": quantity,
        "avg_buy_price": round(avg_buy_price, 2), # 평균 단가
        "invested_amount": round(invested_amount, 2), # 투자 원금
        "current_price": round(current_price, 2), # 현재가
        "current_value": round(current_value, 2), # 평가 금액
        "profit_loss": round(profit_loss, 2), # 손익
        "profit_rate": round(profit_rate, 2) # 수익률
    }

def calculate_all_portfolios(db: Session):
    tickers = (
        db.query(Trade.ticker)
        .distinct() # 중복 제거하여 고유한 ticker 목록 가져오기
        .all()
    )

    portfolios = []

    for ticker in tickers:
        portfolio = calculate_portfolio(db, ticker[0])
        portfolios.append(portfolio)

    return portfolios

def calculate_portfolio_summary(db: Session):
    portfolio_list = calculate_all_portfolios(db)

    total_invested = sum(
        p["invested_amount"]
        for p in portfolio_list
    )

    total_evaluation = sum(
        p["current_value"]
        for p in portfolio_list
    )

    total_profit_loss = (total_evaluation - total_invested)

    total_return_rate = (
        total_profit_loss / total_invested * 100
        if total_invested > 0
        else 0
    )

    return {
        "total_invested": round(total_invested, 2),
        "total_evaluation": round(total_evaluation, 2),
        "total_profit_loss": round(total_profit_loss, 2),
        "total_return_rate": round(total_return_rate, 2)
    }