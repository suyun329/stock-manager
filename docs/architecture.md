# 전체 아키텍처

## 프로젝트 개요

주식 매매 기록을 관리하고, 포트폴리오 성과를 실시간으로 추적하며, AI가 투자 습관을 분석해주는 웹 앱.
한국(KOSPI/KOSDAQ)과 미국(NASDAQ/NYSE) 주식을 모두 지원한다.

---

## 기술 스택

| 레이어 | 기술 | 용도 |
|--------|------|------|
| **백엔드** | FastAPI + Uvicorn | REST API 서버 |
| **ORM** | SQLAlchemy 2.x | DB 접근 |
| **DB** | PostgreSQL | 매매 기록 영구 저장 |
| **주가 조회** | yfinance | 실시간 현재가 (1d history 기준) |
| **종목 검색** | FinanceDataReader | KRX / NASDAQ / NYSE 종목 리스팅 |
| **AI 피드백** | Groq API (llama-3.1-8b-instant) | 투자 습관 분석 |
| **프론트엔드** | React 19 + TypeScript + Vite | SPA |
| **서버 상태** | TanStack React Query v5 | API 캐싱 및 동기화 |
| **스타일** | Tailwind CSS v4 | 유틸리티 기반 스타일링 |
| **HTTP 클라이언트** | Axios | API 호출 |

---

## 디렉토리 구조

```
stock-manager/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── database.py        # SQLAlchemy 엔진, 세션, Base 설정
│   │   │   └── deps.py            # get_db() 의존성 주입
│   │   ├── models/
│   │   │   └── trade.py           # Trade ORM 모델 (DB 테이블 정의)
│   │   ├── schemas/
│   │   │   ├── trade.py           # TradeCreate, TradeResponse (Pydantic)
│   │   │   ├── portfolio.py       # PortfolioResponse, PortfolioSummaryResponse
│   │   │   └── ai_feedback.py     # AIFeedbackResponse
│   │   ├── routers/
│   │   │   ├── trade.py           # /trades, /portfolio 엔드포인트
│   │   │   ├── stocks.py          # /stocks/search, /stocks/names 엔드포인트
│   │   │   └── ai_feedback.py     # /ai-feedback/{ticker} 엔드포인트
│   │   ├── services/
│   │   │   ├── trade_service.py       # update_trade, delete_trade
│   │   │   ├── portfolio_service.py   # 포트폴리오 계산 로직 (핵심)
│   │   │   ├── price_service.py       # yfinance 현재가 조회
│   │   │   ├── ai_feedback_service.py # Groq LLM 호출 및 프롬프트 생성
│   │   │   └── stock_search_service.py# 종목 검색 (백그라운드 preload)
│   │   └── main.py                # FastAPI 앱, 미들웨어, startup hook
│   ├── requirements.txt
│   ├── .env                       # DATABASE_URL, GROQ_API_KEY
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx  # 포트폴리오 현황 (탭: 국내/해외)
│   │   │   ├── TradesPage.tsx     # 매매 기록 CRUD
│   │   │   └── StockDetailPage.tsx# 종목 상세 + AI 피드백
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx     # 전체 레이아웃 (Sidebar + Outlet)
│   │   │   │   └── Sidebar.tsx    # 네비게이션 (대시보드, 매매 내역)
│   │   │   ├── SummaryCards.tsx   # 포트폴리오 요약 4개 카드
│   │   │   ├── PortfolioCard.tsx  # 개별 종목 카드
│   │   │   ├── TradeTable.tsx     # 매매 기록 테이블 (수정/삭제 포함)
│   │   │   ├── TradeFormModal.tsx # 매매 추가/수정 모달 (종목 검색 포함)
│   │   │   └── AIFeedbackCard.tsx # AI 분석 카드 (on-demand 조회)
│   │   ├── api/
│   │   │   ├── portfolio.ts       # getAllPortfolios, getPortfolioSummary 등
│   │   │   ├── trades.ts          # getTrades, createTrade, updateTrade, deleteTrade
│   │   │   ├── stocks.ts          # searchStocks, getStockNames
│   │   │   └── feedback.ts        # getAIFeedback
│   │   ├── lib/
│   │   │   ├── queryClient.ts     # React Query 전역 설정
│   │   │   └── utils.ts           # formatCurrency, formatPercent, cn()
│   │   ├── App.tsx                # 라우팅 정의
│   │   └── main.tsx               # ReactDOM 마운트
│   ├── package.json
│   └── vite.config.ts
├── start.command                  # 백엔드+프론트엔드 동시 실행 스크립트
└── stop.command                   # 프로세스 종료 스크립트
```

---

## 데이터 흐름

### 포트폴리오 조회
```
DashboardPage
  → GET /portfolio?market=KR|US
      → portfolio_service.calculate_all_portfolios()
          → Trade 테이블에서 ticker별 BUY/SELL 집계
          → price_service.get_current_price() → yfinance API
          → 수익률 계산 후 반환
  → GET /portfolio/summary?market=KR|US
      → 위 결과를 합산하여 총 투자액, 총 평가액, 총 수익률 반환
```

### 매매 등록
```
TradeFormModal
  → 종목 검색: GET /stocks/search?q={query}
      → stock_search_service (인메모리 _stocks 검색)
  → 매매 저장: POST /trades
      → Trade ORM 객체 생성 → DB commit
  → React Query invalidateQueries(['portfolio']) → 자동 재조회
```

### AI 피드백
```
AIFeedbackCard (버튼 클릭 시)
  → GET /ai-feedback/{ticker}
      → portfolio_service.calculate_portfolio() → 현재 포트폴리오 계산
      → Trade 전체 이력 조회
      → build_prompt() → 한국어 프롬프트 생성
      → Groq API (llama-3.1-8b-instant) 호출
      → feedback 텍스트 반환
```

---

## 시장 구분 규칙

| market 값 | 거래소 | 통화 | yfinance ticker |
|-----------|--------|------|-----------------|
| `KOSPI`   | 한국거래소 | KRW | `{ticker}.KS` |
| `KOSDAQ`  | 코스닥 | KRW | `{ticker}.KQ` |
| `NASDAQ`  | 나스닥 | USD | `{ticker}` |
| `NYSE`    | 뉴욕증권거래소 | USD | `{ticker}` |

프론트엔드 탭 필터: `KR` → KOSPI/KOSDAQ, `US` → NASDAQ/NYSE
