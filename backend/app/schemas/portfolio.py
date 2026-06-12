from pydantic import BaseModel


class PortfolioResponse(BaseModel):
    ticker: str
    quantity: int
    avg_buy_price: float # 평균 단가
    invested_amount: float # 투자 원금
    current_price: float # 현재가
    profit_loss: float # 손익
    profit_rate: float # 수익률

class PortfolioSummaryResponse(BaseModel):
    total_invested: float
    total_evaluation: float # 총 평가 금액
    total_profit_loss: float
    total_return_rate: float