from pydantic import BaseModel


class PortfolioResponse(BaseModel):
    ticker: str
    quantity: int
    avg_buy_price: float
    invested_amount: float