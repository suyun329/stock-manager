# 백엔드 상세 문서

## 레이어 구조

```
Request
  └─ Router (routers/)        # 엔드포인트 정의, HTTP 요청/응답 처리
       └─ Service (services/) # 비즈니스 로직 (계산, 외부 API 호출)
            └─ Model (models/)# ORM 모델, DB 쿼리
                 └─ DB        # PostgreSQL
```

- **Router**는 요청을 받아 Service를 호출하고, Pydantic 스키마로 응답을 직렬화한다.
- **Service**는 DB 쿼리와 비즈니스 로직만 담당하며, HTTP 레이어를 알지 못한다.
- **Model**은 DB 테이블 구조 정의만 담당한다. 쿼리는 Service에서 직접 작성한다.

---

## API 엔드포인트 레퍼런스

### 매매 기록 (`/trades`)

| 메서드 | 경로 | 요청 바디 | 응답 | 설명 |
|--------|------|-----------|------|------|
| `POST` | `/trades` | `TradeCreate` | `Trade` | 매매 기록 생성 |
| `GET` | `/trades` | - | `Trade[]` | 전체 매매 기록 조회 |
| `PUT` | `/trades/{trade_id}` | `TradeCreate` | `TradeResponse` | 매매 기록 수정 |
| `DELETE` | `/trades/{trade_id}` | - | `{"message": "..."}` | 매매 기록 삭제 |

**TradeCreate 요청 바디:**
```json
{
  "ticker": "AAPL",
  "trade_type": "BUY",        // "BUY" 또는 "SELL" (대소문자 무관, 자동 정규화)
  "quantity": 10,
  "price": 150.0,
  "market": "NASDAQ",         // "KOSPI" | "KOSDAQ" | "NASDAQ" | "NYSE"
  "trade_date": "2026-06-23"  // 선택. null이면 거래일 미기록
}
```

---

### 포트폴리오 (`/portfolio`)

| 메서드 | 경로 | 쿼리 파라미터 | 응답 | 설명 |
|--------|------|---------------|------|------|
| `GET` | `/portfolio` | `market=KR\|US` (선택) | `PortfolioResponse[]` | 전체 포트폴리오 |
| `GET` | `/portfolio/summary` | `market=KR\|US` (선택) | `PortfolioSummaryResponse` | 요약 통계 |
| `GET` | `/portfolio/{ticker}` | - | `PortfolioResponse` | 종목별 포트폴리오 |

**PortfolioResponse:**
```json
{
  "ticker": "AAPL",
  "market": "NASDAQ",
  "currency": "USD",
  "quantity": 10,
  "avg_buy_price": 150.0,
  "invested_amount": 1500.0,
  "current_price": 175.0,
  "evaluation_amount": 1750.0,
  "profit_loss": 250.0,
  "profit_rate": 16.67
}
```

**PortfolioSummaryResponse:**
```json
{
  "total_invested": 5000.0,
  "total_evaluation": 5800.0,
  "total_profit_loss": 800.0,
  "total_return_rate": 16.0,
  "currency": "USD"
}
```

---

### 종목 검색 (`/stocks`)

| 메서드 | 경로 | 파라미터 | 응답 | 설명 |
|--------|------|----------|------|------|
| `GET` | `/stocks/search` | `q={query}` (필수) | `{loading, results[]}` | 종목 검색 |
| `GET` | `/stocks/names` | `tickers=AAPL,MSFT` | `{ticker: name}` | 티커 → 종목명 매핑 |

**`/stocks/search` 응답:**
```json
{
  "loading": false,
  "results": [
    {"ticker": "AAPL", "name": "Apple Inc", "market": "NASDAQ"}
  ]
}
```
- `loading: true`이면 서버가 아직 종목 데이터를 로딩 중이므로 프론트엔드에서 재시도 유도.

---

### AI 피드백 (`/ai-feedback`)

| 메서드 | 경로 | 응답 | 설명 |
|--------|------|------|------|
| `GET` | `/ai-feedback/{ticker}` | `AIFeedbackResponse` | 투자 습관 분석 |

**AIFeedbackResponse:**
```json
{
  "ticker": "AAPL",
  "profit_rate": 16.67,
  "feedback": "매매 패턴 분석 결과..."
}
```

---

## 서비스 레이어 상세

### `portfolio_service.py`

핵심 계산 로직. 모든 포트폴리오 수치는 여기서 계산한다.

**`calculate_portfolio(db, ticker)`**

1. 해당 ticker의 모든 Trade 레코드를 가져온다.
2. BUY/SELL을 분리하여 집계:
   - `buy_qty`: 총 매수 수량
   - `sell_qty`: 총 매도 수량
   - `total_buy_amount`: 전체 매수 금액 합산 (quantity × price)
   - `total_buy_quantity`: 전체 매수 수량 합산
3. 계산식:

```python
quantity = buy_qty - sell_qty                           # 현재 보유 수량
avg_buy_price = total_buy_amount / total_buy_quantity   # 평균 매수 단가
invested_amount = quantity * avg_buy_price              # 투자 원금
evaluation_amount = quantity * current_price            # 현재 평가액
profit_loss = evaluation_amount - invested_amount
profit_rate = profit_loss / invested_amount * 100
```

**avg_buy_price 계산 주의사항:** 매도한 수량에 관계없이 전체 매수 이력을 기준으로 평균을 낸다. 예를 들어 10주 매수 후 5주 매도했다면 `quantity=5`이지만 `avg_buy_price`는 여전히 10주 전체 매수 기준이다.

**`calculate_all_portfolios(db, market_filter)`**
- DB에서 ticker 목록을 뽑아 `calculate_portfolio`를 ticker별로 반복 호출한다.
- `market_filter="KR"` → KOSPI/KOSDAQ만, `"US"` → 나머지만 필터링.

**`calculate_portfolio_summary(db, market_filter)`**
- `calculate_all_portfolios` 결과를 합산하여 총계를 반환한다.
- `currency`는 `market_filter`가 `"KR"`이면 `"KRW"`, 그 외는 `"USD"`.

---

### `price_service.py`

**`get_current_price(ticker, market)`**
- yfinance의 `Ticker.history(period="1d")`에서 마지막 종가(`Close`)를 반환한다.
- 데이터가 없으면 `0.0` 반환 (장 휴장일, 상장폐지 등).

**`get_yf_ticker(ticker, market)`**
- yfinance는 한국 종목에 접미사가 필요하다:
  - KOSPI: `{ticker}.KS` (예: `005930.KS`)
  - KOSDAQ: `{ticker}.KQ`
  - 미국 종목: 그대로 사용

---

### `ai_feedback_service.py`

**Groq API 호출 방식:**
- Groq는 OpenAI API와 호환되는 인터페이스를 제공한다.
- OpenAI Python SDK를 그대로 사용하되 `base_url`만 Groq 엔드포인트로 교체.

```python
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY"),
)
```

**`build_prompt(ticker, portfolio, trades)`**
- 매매 이력을 `매수/매도 N주 @ $price` 형식으로 나열한다.
- 포트폴리오 현황(수량, 평균 단가, 현재가, 수익률)을 포함한다.
- 한국어 응답을 명시적으로 요청한다.
- 모델: `llama-3.1-8b-instant`, `max_tokens=1024`

---

### `stock_search_service.py`

**백그라운드 preload 구조:**
- 앱 시작 시 `preload()`가 daemon 스레드를 띄워 KRX + NASDAQ + NYSE 종목 전체를 인메모리 `_stocks` 리스트에 로드한다.
- `_lock`(threading.Lock)으로 읽기/쓰기 경합을 방지한다.
- `is_loaded()` 플래그를 통해 로딩 완료 여부를 확인한다.

**`search_stocks(query, limit=10)`**
- `_stocks`를 순회하며 종목명 또는 티커에 query가 포함된 항목을 반환한다.
- 대소문자 구분 없음 (`.lower()` 처리).

**`get_names_by_tickers(tickers)`**
- 티커 목록을 받아 `{ticker: name}` 딕셔너리를 반환한다.
- `_stocks`에 없는 티커는 티커 자체를 이름으로 fallback.

---

### `trade_service.py`

**`update_trade(db, trade_id, trade_data)`**
- `trade_id`로 Trade 레코드를 조회한다.
- 없으면 `None` 반환 → 라우터에서 404 처리.
- 모든 필드를 교체하고 `commit` + `refresh`.

**`delete_trade(db, trade_id)`**
- 없으면 `None` 반환 → 라우터에서 404 처리.
- `db.delete(trade)` → `commit`.

---

## 데이터 모델

### ORM 모델: `Trade` (`models/trade.py`)

```python
class Trade(Base):
    __tablename__ = "trades"

    id         = Column(Integer, primary_key=True, index=True)
    ticker     = Column(String, nullable=False)
    trade_type = Column(String, nullable=False)   # "BUY" | "SELL"
    quantity   = Column(Integer, nullable=False)
    price      = Column(Float, nullable=False)
    market     = Column(String, nullable=False, server_default="NASDAQ")
    trade_date = Column(Date, nullable=True)      # 거래일 (선택)
```

### Pydantic 스키마

| 스키마 | 위치 | 용도 |
|--------|------|------|
| `TradeCreate` | `schemas/trade.py` | POST/PUT 요청 바디 |
| `TradeResponse` | `schemas/trade.py` | PUT 응답 (id 포함) |
| `PortfolioResponse` | `schemas/portfolio.py` | GET /portfolio 응답 |
| `PortfolioSummaryResponse` | `schemas/portfolio.py` | GET /portfolio/summary 응답 |
| `AIFeedbackResponse` | `schemas/ai_feedback.py` | GET /ai-feedback 응답 |

**`TradeCreate` 상세 (`schemas/trade.py`):**
```python
class TradeType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class TradeCreate(BaseModel):
    ticker: str
    trade_type: TradeType          # Enum으로 "BUY" / "SELL"만 허용
    quantity: int
    price: float
    market: str = "NASDAQ"
    trade_date: Optional[date] = None   # 거래일 (미입력 시 null)

    @field_validator('ticker')
    def uppercase_ticker(cls, v): return v.upper()

    @field_validator('trade_type', mode='before')
    def normalize_trade_type(cls, v): return v.upper()
```

**`TradeResponse`**는 `TradeCreate`를 상속하지 않고 독립 정의. `trade_date: Optional[date]` 포함. `Config.from_attributes = True`로 ORM 객체에서 직접 직렬화.

---

## 데이터베이스 설정 (`core/`)

**`database.py`**
```python
DATABASE_URL = os.getenv("DATABASE_URL")  # PostgreSQL 연결 문자열
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

**`deps.py`**
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
FastAPI의 `Depends(get_db)`로 라우터에 주입된다. 요청마다 새 세션을 열고 응답 후 닫는다.

---

## 주요 설계 결정

### startup 훅에서 마이그레이션을 처리하는 이유
Alembic 등의 마이그레이션 도구를 도입하는 대신, `main.py`의 `startup` 이벤트에서 `ADD COLUMN IF NOT EXISTS`로 처리했다. 개발 초기 단계에서 단순하게 유지하기 위한 선택이다. 현재 startup에서 처리하는 마이그레이션:

```python
# market 컬럼 추가 (기존 데이터에 없던 컬럼)
"ALTER TABLE trades ADD COLUMN IF NOT EXISTS market VARCHAR DEFAULT 'NASDAQ'"

# trade_date 컬럼 추가
"ALTER TABLE trades ADD COLUMN IF NOT EXISTS trade_date DATE"

# 기존 데이터 대소문자 정규화 (ticker, trade_type을 항상 대문자로 통일)
"UPDATE trades SET ticker = UPPER(ticker)"
"UPDATE trades SET trade_type = UPPER(trade_type)"
```

ticker/trade_type 대소문자 정규화는 `TradeCreate` 스키마의 validator와 쌍을 이뤄, 신규 입력과 기존 데이터 모두 대문자로 보장한다.

### avg_buy_price를 전체 매수 기준으로 계산하는 이유
매도 시 어떤 주식을 매도했는지(FIFO/LIFO 등)를 추적하지 않는다. 대신 전체 매수 이력의 가중평균을 `avg_buy_price`로 사용한다. 단순하고 예측 가능하지만, 매도 후 남은 포지션의 "실제" 취득 원가와 다를 수 있다.

### 종목 데이터를 백그라운드 preload하는 이유
FinanceDataReader로 KRX + NASDAQ + NYSE를 한 번에 로드하면 수초가 걸린다. 서버 시작 시 daemon 스레드로 미리 로드해두고 인메모리에서 검색해, 검색 응답을 빠르게 유지한다. 로딩 중에는 `loading: true`를 반환해 프론트엔드가 재시도하도록 안내한다.

### Groq API를 OpenAI SDK로 호출하는 이유
Groq는 OpenAI API와 동일한 인터페이스(`/v1/chat/completions`)를 제공한다. 별도 SDK 없이 `base_url`만 교체해 사용할 수 있어, 추후 다른 OpenAI 호환 서비스(Together AI, local Ollama 등)로 교체가 쉽다.
