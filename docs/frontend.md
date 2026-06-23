# 프론트엔드 상세 문서

## 라우팅 구조 (`src/App.tsx`)

```
/ (Layout)
├── index   → DashboardPage     # 포트폴리오 현황 대시보드
├── /trades → TradesPage        # 매매 기록 CRUD
└── /portfolio/:ticker → StockDetailPage   # 종목 상세 + AI 피드백
```

모든 페이지는 `Layout`으로 감싸진다. `Layout`은 `Sidebar`와 `<Outlet />`으로 구성된다.

---

## 페이지별 역할과 쿼리 키

### `DashboardPage.tsx`

| 역할 | 국내/해외 탭별 포트폴리오 현황 표시 |
|------|--------------------------------------|

**로컬 상태:**
- `activeTab: 'KR' | 'US'` — 탭 전환

**React Query 쿼리:**
```
['portfolio', 'summary', activeTab]  → GET /portfolio/summary?market=KR|US
['portfolio', 'all', activeTab]      → GET /portfolio?market=KR|US
['stock-names', tickers]             → GET /stocks/names?tickers=...
                                       (포트폴리오 목록이 로드된 후 enabled)
```

**컴포넌트 구성:**
```
DashboardPage
├── SummaryCards (요약 4개 카드)
└── PortfolioCard[] (종목별 카드, 클릭 시 /portfolio/:ticker 이동)
```

---

### `TradesPage.tsx`

| 역할 | 매매 기록 조회 및 추가/수정/삭제 |
|------|-----------------------------------|

**로컬 상태:**
- `activeTab: 'KR' | 'US'` — 탭 전환
- `showModal: boolean` — TradeFormModal 표시 여부

**React Query 쿼리:**
```
['trades']                      → GET /trades (전체)
['stock-names', uniqueTickers]  → GET /stocks/names?tickers=... (enabled: 쿼리 완료 후)
```

**클라이언트 필터링:** API는 전체 매매 기록을 가져오고, `activeTab`에 따라 클라이언트에서 필터링한다.
- `KR`: market이 `KOSPI` 또는 `KOSDAQ`인 것만
- `US`: 그 외

**컴포넌트 구성:**
```
TradesPage
├── 탭 (국내/해외)
├── "매매 추가" 버튼
├── TradeTable (매매 기록 테이블, 수정/삭제 포함)
└── TradeFormModal (showModal이 true일 때)
```

---

### `StockDetailPage.tsx`

| 역할 | 개별 종목 포트폴리오 상세 + AI 피드백 |
|------|---------------------------------------|

**URL 파라미터:** `ticker` (예: `/portfolio/AAPL`)

**React Query 쿼리:**
```
['portfolio', ticker]       → GET /portfolio/{ticker}
['trades']                  → GET /trades (전체, 클라이언트에서 ticker로 필터링)
['stock-names', [ticker]]   → GET /stocks/names?tickers={ticker}
```

**컴포넌트 구성:**
```
StockDetailPage
├── 종목명 + 시장 정보
├── 포트폴리오 상세 수치 (수량, 평균단가, 현재가, 수익률 등)
├── AIFeedbackCard
└── TradeTable (해당 종목 매매 이력만)
```

---

## 컴포넌트 맵

| 컴포넌트 | 위치 | Props 요약 |
|----------|------|-----------|
| `Layout` | `layout/Layout.tsx` | 없음. Sidebar + Outlet. |
| `Sidebar` | `layout/Sidebar.tsx` | 없음. 네비게이션 링크 고정. |
| `SummaryCards` | `SummaryCards.tsx` | `summary: PortfolioSummary` |
| `PortfolioCard` | `PortfolioCard.tsx` | `item: PortfolioItem`, `name?: string` |
| `TradeTable` | `TradeTable.tsx` | `trades: Trade[]`, `stockNames?: Record<string, string>` |
| `TradeFormModal` | `TradeFormModal.tsx` | `onClose: () => void`, `editing?: Trade \| null` |
| `AIFeedbackCard` | `AIFeedbackCard.tsx` | `ticker: string` |

**`PortfolioCard`:** 손익률이 양수면 빨간색, 음수면 파란색 (한국 주식 컨벤션). 클릭 시 `/portfolio/:ticker`로 이동.

**`TradeFormModal`:** 두 가지 모드 지원.
- `editing`이 null/undefined → 신규 등록 (POST /trades)
- `editing`에 기존 Trade 전달 → 수정 (PUT /trades/:id)

폼 구성: 시장 탭(KR/US) → 종목 검색(debounce 300ms, 드롭다운) → 매수/매도 → 수량 → 단가 → 거래일(선택)

**`AIFeedbackCard`:** 버튼 클릭 전까지 API 호출 없음 (on-demand). 결과 표시 후 Markdown 렌더링.

---

## API 레이어 (`src/api/`)

모든 API 함수는 Axios를 사용하며, 기본 URL은 `http://localhost:8000`.

### `portfolio.ts`
```typescript
getAllPortfolios(market?: 'KR' | 'US'): Promise<PortfolioItem[]>
getPortfolioByTicker(ticker: string): Promise<PortfolioItem>
getPortfolioSummary(market?: 'KR' | 'US'): Promise<PortfolioSummary>
```

### `trades.ts`
```typescript
getTrades(): Promise<Trade[]>
createTrade(trade: TradeCreate): Promise<Trade>
updateTrade(id: number, trade: TradeCreate): Promise<Trade>
deleteTrade(id: number): Promise<void>

// Trade / TradeCreate에 trade_date?: string | null 포함
```

### `stocks.ts`
```typescript
searchStocks(q: string): Promise<{ loading: boolean, results: StockResult[] }>
getStockNames(tickers: string[]): Promise<Record<string, string>>
```

### `feedback.ts`
```typescript
getAIFeedback(ticker: string): Promise<AIFeedback>
```

---

## 상태 관리 패턴

### React Query (서버 상태)
서버에서 오는 데이터는 전부 React Query로 관리한다.

**쿼리 키 설계 원칙:**
- 배열 기반 계층 구조: `['portfolio', 'summary', activeTab]`
- `activeTab`이 키에 포함되어 탭 전환 시 자동으로 다른 캐시 사용

**주요 설정 (`queryClient.ts`):**
```typescript
staleTime: 30_000   // 30초 동안 데이터를 fresh로 간주 (중복 요청 방지)
retry: 1            // 실패 시 1회 재시도
```

**Mutation 후 동기화 패턴:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  queryClient.invalidateQueries({ queryKey: ['trades'] })
}
```
매매 등록/수정/삭제 후 포트폴리오와 매매 기록 쿼리를 무효화해 자동 재조회한다.

### useState (UI 상태)
서버 데이터와 무관한 UI 상태만 useState로 관리한다.
- 모달 열림/닫힘
- 탭 선택 (`activeTab`)
- 폼 입력값
- 드롭다운 표시 여부

---

## 유틸리티 함수 (`src/lib/utils.ts`)

| 함수 | 설명 |
|------|------|
| `cn(...classes)` | Tailwind 클래스 병합 (clsx + tailwind-merge) |
| `formatCurrency(value, currency)` | KRW/USD 국제화 포맷팅 (Intl.NumberFormat) |
| `formatPercent(value)` | 수익률 포맷팅 (`+16.67%` 형태) |

---

## 검색 UX 패턴 (`TradeFormModal`)

1. 시장 탭(KR/US) 선택 → 결과를 KR_MARKETS 기준으로 클라이언트 필터링
2. 입력 → 300ms 디바운싱 → `GET /stocks/search?q={query}`
3. 응답에 `loading: true`가 오면 "잠시 후 다시 검색" 안내 표시 (`serverLoading` 상태)
4. 결과 클릭 시 `form.ticker`와 `form.market` 자동 세팅, 입력창에는 "종목명 (티커)" 표시
5. 드롭다운은 클릭 아웃사이드(`mousedown` 이벤트)로 닫힘
6. `form.ticker`가 비어 있으면 제출 버튼 비활성화 (직접 티커 입력 불가, 반드시 검색 선택)
7. `trade_date` 필드: date input, 선택 사항이며 미입력 시 `null`로 전송

**로컬 상태 목록:**
```
marketType       'KR' | 'US'      시장 탭
form             TradeCreate      폼 데이터 (ticker, trade_type, quantity, price, market, trade_date)
stockQuery       string           검색 입력값 (form.ticker와 별도 관리)
results          StockResult[]    API 검색 결과 (필터 전)
showDropdown     boolean          드롭다운 표시 여부
isSearching      boolean          요청 중 로딩 표시
serverLoading    boolean          preload 미완료 안내
```
