from pydantic import BaseModel


class TradeCreate(BaseModel):
    ticker: str
    trade_type: str
    quantity: int
    price: float

class TradeResponse(TradeCreate):
    id: int

    class Config:
        from_attributes = True