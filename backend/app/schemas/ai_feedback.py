from pydantic import BaseModel

class AIFeedbackResponse(BaseModel):
    ticker: str
    profit_rate: float
    feedback: str