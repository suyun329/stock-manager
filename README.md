# Stock Manager

주식 매매 기록을 관리하고, 포트폴리오 성과를 실시간으로 추적하며, AI가 투자 습관을 분석해주는 풀스택 웹 애플리케이션입니다.

## 주요 기능

- **포트폴리오 추적** — 보유 종목의 평균 매수 단가, 현재가, 수익률을 실시간으로 계산
- **매매 기록 관리** — 매수/매도 기록 추가·수정·삭제 (CRUD)
- **국내/해외 주식 지원** — KOSPI, KOSDAQ, NASDAQ, NYSE 종목 통합 관리
- **종목 검색** — KRX, NASDAQ, NYSE 전 종목 이름/티커 검색
- **AI 투자 분석** — 매매 이력을 기반으로 투자 습관, 리스크, 개선점을 AI가 한국어로 분석

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Backend** | Python, FastAPI, SQLAlchemy |
| **Database** | PostgreSQL |
| **주가 조회** | yfinance |
| **종목 데이터** | FinanceDataReader |
| **AI** | Groq API (Llama 3.1 8B) |
| **Frontend** | React 19, TypeScript, Vite |
| **상태 관리** | TanStack React Query v5 |
| **스타일** | Tailwind CSS v4 |

## 실행 방법

### 사전 요구사항
- Python 3.10+
- Node.js 18+
- PostgreSQL

### 백엔드

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

`.env` 파일 생성 (`.env.example` 참고):
```
DATABASE_URL=postgresql://user:password@localhost:5432/stock_manager
GROQ_API_KEY=your_groq_api_key
```

```bash
uvicorn app.main:app --reload
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 프로젝트 구조

```
stock-manager/
├── backend/
│   └── app/
│       ├── models/       # SQLAlchemy ORM 모델
│       ├── schemas/      # Pydantic 스키마
│       ├── routers/      # API 엔드포인트
│       ├── services/     # 비즈니스 로직
│       └── core/         # DB 설정, 의존성 주입
└── frontend/
    └── src/
        ├── pages/        # 대시보드, 매매 내역, 종목 상세
        ├── components/   # UI 컴포넌트
        └── api/          # API 호출 함수
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/portfolio` | 전체 포트폴리오 조회 |
| `GET` | `/portfolio/summary` | 포트폴리오 요약 통계 |
| `GET` | `/portfolio/{ticker}` | 종목별 포트폴리오 |
| `POST` | `/trades` | 매매 기록 추가 |
| `PUT` | `/trades/{id}` | 매매 기록 수정 |
| `DELETE` | `/trades/{id}` | 매매 기록 삭제 |
| `GET` | `/stocks/search` | 종목 검색 |
| `GET` | `/ai-feedback/{ticker}` | AI 투자 습관 분석 |
