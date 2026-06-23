from enum import Enum
from typing import Optional
from datetime import date
from pydantic import BaseModel, field_validator


class TradeType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class TradeCreate(BaseModel):
    ticker: str
    trade_type: TradeType
    quantity: int
    price: float
    market: str = "NASDAQ"
    trade_date: Optional[date] = None

    @field_validator('ticker')
    @classmethod
    def uppercase_ticker(cls, v: str) -> str:
        return v.upper()

    @field_validator('trade_type', mode='before')
    @classmethod
    def normalize_trade_type(cls, v) -> str:
        return v.upper() if isinstance(v, str) else v


class TradeResponse(BaseModel):
    id: int
    ticker: str
    trade_type: str
    quantity: int
    price: float
    market: str
    trade_date: Optional[date] = None

    class Config:
        from_attributes = True
