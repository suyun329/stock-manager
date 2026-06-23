from fastapi import APIRouter, Query
from app.services.stock_search_service import search_stocks, is_loaded, get_names_by_tickers

router = APIRouter(prefix="/stocks", tags=["stocks"])

@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    if not is_loaded():
        return {"loading": True, "results": []}
    return {"loading": False, "results": search_stocks(q)}

@router.get("/names")
def names(tickers: str = Query(...)):
    ticker_list = [t.strip() for t in tickers.split(',') if t.strip()]
    return get_names_by_tickers(ticker_list)
