from pydantic import BaseModel


class PortfolioResponse(BaseModel):
    ticker: str
    market: str
    currency: str
    quantity: int
    avg_buy_price: float
    invested_amount: float
    current_price: float
    evaluation_amount: float
    profit_loss: float
    profit_rate: float

class PortfolioSummaryResponse(BaseModel):
    total_invested: float
    total_evaluation: float
    total_profit_loss: float
    total_return_rate: float
    currency: str
