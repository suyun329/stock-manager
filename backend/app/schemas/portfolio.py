from pydantic import BaseModel


class PortfolioResponse(BaseModel):
    ticker: str
    quantity: int
    avg_buy_price: float # 평균 단가
    invested_amount: float # 투자 원금
    current_price: float # 현재가
    profit_loss: float # 손익