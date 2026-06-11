def get_current_price(ticker: str) -> float:
    # 임시 가격 데이터
    price = {
        "a": 120.0,
        "AAPL": 150.0,
    }

    # get을 사용하여 ticker를 가져옴, 키가 없는 경우 0.0 반환
    return price.get(ticker, 0.0)