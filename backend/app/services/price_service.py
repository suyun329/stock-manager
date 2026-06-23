import yfinance as yf

def get_yf_ticker(ticker: str, market: str) -> str:
    if market == "KOSPI":
        return f"{ticker}.KS"
    elif market == "KOSDAQ":
        return f"{ticker}.KQ"
    return ticker

def get_current_price(ticker: str, market: str = "NASDAQ") -> float:
    yf_ticker = get_yf_ticker(ticker, market)
    stock = yf.Ticker(yf_ticker)
    history = stock.history(period="1d")
    if history.empty:
        return 0.0
    return float(history["Close"].iloc[-1])
