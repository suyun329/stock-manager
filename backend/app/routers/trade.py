from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.trade import Trade
from app.models.user import User
from app.schemas.trade import TradeCreate, TradeResponse
from app.services.portfolio_service import calculate_portfolio, calculate_all_portfolios, calculate_portfolio_summary
from app.services.trade_service import update_trade, delete_trade
from app.schemas.portfolio import PortfolioResponse, PortfolioSummaryResponse

router = APIRouter()


@router.post("/trades")
def create_trade(
    trade: TradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trade_db = Trade(
        ticker=trade.ticker,
        trade_type=trade.trade_type,
        quantity=trade.quantity,
        price=trade.price,
        market=trade.market,
        trade_date=trade.trade_date,
        user_id=current_user.id,
    )
    db.add(trade_db)
    db.commit()
    db.refresh(trade_db)
    return trade_db


@router.get("/trades")
def get_trades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Trade).filter(Trade.user_id == current_user.id).all()


@router.get("/portfolio", response_model=list[PortfolioResponse])
def get_all_portfolios(
    market: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return calculate_all_portfolios(db, market_filter=market, user_id=current_user.id)


@router.get("/portfolio/summary", response_model=PortfolioSummaryResponse)
def get_portfolio_summary(
    market: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return calculate_portfolio_summary(db, market_filter=market, user_id=current_user.id)


@router.get("/portfolio/{ticker}", response_model=PortfolioResponse)
def get_portfolio(
    ticker: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = calculate_portfolio(db, ticker.upper(), user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="포트폴리오 데이터가 없습니다.")
    return result


@router.put("/trades/{trade_id}", response_model=TradeResponse)
def update_trade_endpoint(
    trade_id: int,
    trade_data: TradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trade = db.query(Trade).filter(Trade.id == trade_id, Trade.user_id == current_user.id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    trade = update_trade(db, trade_id, trade_data)
    return trade


@router.delete("/trades/{trade_id}")
def delete_trade_endpoint(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trade = db.query(Trade).filter(Trade.id == trade_id, Trade.user_id == current_user.id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    result = delete_trade(db, trade_id)
    return result
