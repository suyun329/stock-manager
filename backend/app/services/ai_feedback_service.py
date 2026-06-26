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
        f"- {'매수' if t.trade_type.upper() == 'BUY' else '매도'} {t.quantity}주 @ {t.price}"
        + (f" ({t.trade_date})" if t.trade_date else "")
        for t in trades
    ])
    return f"""아래는 사용자의 {ticker} 종목 매매 데이터입니다. 투자 습관을 분석하고 피드백을 작성해주세요.

[매매 이력]
{trade_lines}

[포트폴리오 현황]
- 보유 수량: {portfolio['quantity']}주
- 평균 매수 단가: {portfolio['avg_buy_price']}
- 현재가: {portfolio['current_price']}
- 투자 원금: {portfolio['invested_amount']}
- 평가 금액: {portfolio['evaluation_amount']}
- 수익률: {portfolio['profit_rate']}%

반드시 지켜야 할 규칙:
1. 오직 한국어로만 작성할 것. 영어·일본어·중국어 단어를 절대 사용하지 말 것.
2. 매매 패턴, 리스크 관리, 개선점을 포함하여 3~4문장으로 작성할 것.
3. 숫자와 % 기호는 그대로 사용해도 됨."""

def get_ai_feedback(db: Session, ticker: str, user_id: int = None):
    portfolio = calculate_portfolio(db, ticker, user_id=user_id)
    query = db.query(Trade).filter(Trade.ticker == ticker)
    if user_id is not None:
        query = query.filter(Trade.user_id == user_id)
    trades = query.all()
    prompt = build_prompt(ticker, portfolio, trades)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=1024,
        messages=[
            {
                "role": "system",
                "content": "당신은 한국어로만 응답하는 주식 투자 습관 분석 전문가입니다. 영어, 일본어, 중국어를 포함한 외국어 단어를 절대 사용하지 마세요. 모든 답변은 자연스러운 한국어 문장으로만 작성하세요.",
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
