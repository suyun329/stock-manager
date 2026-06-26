import threading
import FinanceDataReader as fdr

_stocks: list[dict] = []
_loaded = False
_lock = threading.Lock()

def _load():
    global _stocks, _loaded
    results = []

    try:
        krx = fdr.StockListing('KRX')
        for _, row in krx.iterrows():
            results.append({
                "ticker": str(row['Code']),
                "name": str(row['Name']),
                "market": str(row.get('Market', 'KRX')),
            })
    except Exception:
        pass

    try:
        etf_kr = fdr.StockListing('ETF/KR')
        for _, row in etf_kr.iterrows():
            results.append({
                "ticker": str(row['Symbol']),
                "name": str(row['Name']),
                "market": "KOSPI",
            })
    except Exception:
        pass

    for market in ('NASDAQ', 'NYSE', 'AMEX'):
        try:
            df = fdr.StockListing(market)
            for _, row in df.iterrows():
                results.append({
                    "ticker": str(row['Symbol']),
                    "name": str(row['Name']),
                    "market": market,
                })
        except Exception:
            pass

    with _lock:
        _stocks = results
        _loaded = True

def preload():
    """앱 시작 시 백그라운드에서 종목 데이터 로딩"""
    t = threading.Thread(target=_load, daemon=True)
    t.start()

def search_stocks(query: str, limit: int = 10) -> list[dict]:
    q = query.strip().lower()
    if not q:
        return []
    with _lock:
        stocks = _stocks
    results = [
        s for s in stocks
        if q in s['name'].lower() or q in s['ticker'].lower()
    ]
    return results[:limit]

def get_names_by_tickers(tickers: list[str]) -> dict[str, str]:
    ticker_set = set(tickers)
    result = {}
    with _lock:
        for s in _stocks:
            if s['ticker'] in ticker_set:
                result[s['ticker']] = s['name']
    for t in tickers:
        if t not in result:
            result[t] = t
    return result

def is_loaded() -> bool:
    with _lock:
        return _loaded
