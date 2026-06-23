from sqlalchemy.orm import Session
from app.models.trade import Trade
from app.services.price_service import get_current_price

KR_MARKETS = {"KOSPI", "KOSDAQ"}

def get_currency(market: str) -> str:
    return "KRW" if market in KR_MARKETS else "USD"

def calculate_portfolio(db: Session, ticker: str):
    trades = db.query(Trade).filter(Trade.ticker == ticker).all()
    if not trades:
        return None

    market = trades[0].market or "NASDAQ"
    currency = get_currency(market)
    current_price = get_current_price(ticker, market)

    buy_qty = 0
    sell_qty = 0
    total_buy_amount = 0
    total_buy_quantity = 0

    for trade in trades:
        if trade.trade_type.upper() == "BUY":
            buy_qty += trade.quantity
            total_buy_quantity += trade.quantity
            total_buy_amount += trade.quantity * trade.price
        elif trade.trade_type.upper() == "SELL":
            sell_qty += trade.quantity

    quantity = buy_qty - sell_qty
    avg_buy_price = total_buy_amount / total_buy_quantity if total_buy_quantity > 0 else 0
    invested_amount = quantity * avg_buy_price
    evaluation_amount = quantity * current_price
    profit_loss = evaluation_amount - invested_amount
    profit_rate = (profit_loss / invested_amount * 100) if invested_amount > 0 else 0

    return {
        "ticker": ticker,
        "market": market,
        "currency": currency,
        "quantity": quantity,
        "avg_buy_price": round(avg_buy_price, 2),
        "invested_amount": round(invested_amount, 2),
        "current_price": round(current_price, 2),
        "evaluation_amount": round(evaluation_amount, 2),
        "profit_loss": round(profit_loss, 2),
        "profit_rate": round(profit_rate, 2),
    }

def calculate_all_portfolios(db: Session, market_filter: str = None):
    tickers = db.query(Trade.ticker).distinct().all()
    portfolios = []
    for (ticker,) in tickers:
        portfolio = calculate_portfolio(db, ticker)
        if not portfolio:
            continue
        if market_filter == "KR" and portfolio["market"] not in KR_MARKETS:
            continue
        if market_filter == "US" and portfolio["market"] in KR_MARKETS:
            continue
        portfolios.append(portfolio)
    return portfolios

def calculate_portfolio_summary(db: Session, market_filter: str = None):
    portfolio_list = calculate_all_portfolios(db, market_filter)
    currency = "KRW" if market_filter == "KR" else "USD"

    total_invested = sum(p["invested_amount"] for p in portfolio_list)
    total_evaluation = sum(p["evaluation_amount"] for p in portfolio_list)
    total_profit_loss = total_evaluation - total_invested
    total_return_rate = (total_profit_loss / total_invested * 100) if total_invested > 0 else 0

    return {
        "total_invested": round(total_invested, 2),
        "total_evaluation": round(total_evaluation, 2),
        "total_profit_loss": round(total_profit_loss, 2),
        "total_return_rate": round(total_return_rate, 2),
        "currency": currency,
    }
