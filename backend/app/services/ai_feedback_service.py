import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
from sqlalchemy.orm import Session
from app.services.portfolio_service import calculate_portfolio
from app.models.trade import Trade

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY"),
)

def build_prompt(ticker: str, portfolio: dict, trades: list) -> str:
    trade_lines = "\n".join([
        f"- {'매수' if t.trade_type.upper() == 'BUY' else '매도'} {t.quantity}주 @ ${t.price}"
        + (f" ({t.trade_date})" if t.trade_date else "")
        for t in trades
    ])
    return f"""당신은 투자 습관 분석 전문가입니다. 아래 사용자의 {ticker} 주식 매매 데이터를 분석하고 투자 습관에 대한 피드백을 2~3문장으로 한국어로 작성해주세요.

매매 이력:
{trade_lines}

포트폴리오 현황:
- 보유 수량: {portfolio['quantity']}주
- 평균 매수 단가: ${portfolio['avg_buy_price']}
- 현재가: ${portfolio['current_price']}
- 투자 원금: ${portfolio['invested_amount']}
- 평가 금액: ${portfolio['evaluation_amount']}
- 수익률: {portfolio['profit_rate']}%

투자 습관(매매 패턴, 리스크 관리, 개선점 등)에 대한 피드백을 작성해주세요."""

def get_ai_feedback(db: Session, ticker: str, user_id: int = None):
    portfolio = calculate_portfolio(db, ticker, user_id=user_id)
    query = db.query(Trade).filter(Trade.ticker == ticker)
    if user_id is not None:
        query = query.filter(Trade.user_id == user_id)
    trades = query.all()
    prompt = build_prompt(ticker, portfolio, trades)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=1024,
        messages=[
            {
                "role": "system",
                "content": "You are an investment habit analyst. You must always respond in Korean (한국어) only. Never use any other language.",
            },
            {"role": "user", "content": prompt},
        ],
    )
    feedback = response.choices[0].message.content
    return {
        "ticker": ticker,
        "profit_rate": portfolio["profit_rate"],
        "feedback": feedback
    }
