import yfinance as yf

def get_current_price(ticker: str) -> float:

    stock = yf.Ticker(ticker)
    history = stock.history(period="1d")

    if history.empty:
        return 0.0

    return float(history["Close"].iloc[-1])