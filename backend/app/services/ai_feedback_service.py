from app.services.portfolio_service import calculate_portfolio

def generate_feedback(profit_rate: float) -> str:
    if profit_rate >= 20:
        return "수익률이 높습니다. 일부 수익 실현을 고려해볼 수 있습니다."

    elif profit_rate >= 0:
        return "양호한 수익 구간입니다. 보유 전략을 유지할 수 있습니다."

    else:
        return "손실 상태입니다. 투자 근거를 다시 점검해보세요."
    

def get_ai_feedback(db, ticker):
    portfolio = calculate_portfolio(db, ticker)

    feedback = generate_feedback(
        portfolio["profit_rate"]
    )

    return {
        "ticker": ticker,
        "profit_rate": portfolio["profit_rate"],
        "feedback": feedback
    }