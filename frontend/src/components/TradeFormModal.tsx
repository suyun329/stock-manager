import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTrade, updateTrade, type Trade, type TradeCreate } from '@/api/trades'
import { searchStocks, type StockResult } from '@/api/stocks'
import { cn } from '@/lib/utils'

interface Props {
  onClose: () => void
  editing?: Trade | null
}

const KR_MARKETS = ['KOSPI', 'KOSDAQ']

type MarketType = 'US' | 'KR'

const empty: TradeCreate = { ticker: '', trade_type: 'BUY', quantity: 0, price: 0, market: 'KOSPI', trade_date: null }

export default function TradeFormModal({ onClose, editing }: Props) {
  const qc = useQueryClient()
  const [marketType, setMarketType] = useState<MarketType>('KR')
  const [form, setForm] = useState<TradeCreate>(empty)
  const [stockQuery, setStockQuery] = useState('')
  const [results, setResults] = useState<StockResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [serverLoading, setServerLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editing) {
      const isKR = KR_MARKETS.includes(editing.market)
      setMarketType(isKR ? 'KR' : 'US')
      setForm({
        ticker: editing.ticker,
        trade_type: editing.trade_type,
        quantity: editing.quantity,
        price: editing.price,
        market: editing.market ?? 'NASDAQ',
        trade_date: editing.trade_date ?? null,
      })
      setStockQuery(editing.ticker)
    }
  }, [editing])

  const handleMarketTypeChange = (type: MarketType) => {
    setMarketType(type)
    setStockQuery('')
    setResults([])
    setShowDropdown(false)
    setForm((prev) => ({
      ...prev,
      ticker: '',
      market: type === 'KR' ? 'KOSPI' : 'NASDAQ',
    }))
  }

  const filteredResults = marketType === 'KR'
    ? results.filter((r) => KR_MARKETS.includes(r.market))
    : results.filter((r) => !KR_MARKETS.includes(r.market))

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!stockQuery || stockQuery === form.ticker) {
      setResults([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await searchStocks(stockQuery)
        if (data.loading) {
          setServerLoading(true)
          setResults([])
        } else {
          setServerLoading(false)
          setResults(data.results)
        }
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [stockQuery])

  useEffect(() => {
    setShowDropdown(filteredResults.length > 0 && !!stockQuery && stockQuery !== form.ticker)
  }, [filteredResults, stockQuery, form.ticker])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectStock = (stock: StockResult) => {
    setForm((prev) => ({ ...prev, ticker: stock.ticker, market: stock.market }))
    setStockQuery(`${stock.name} (${stock.ticker})`)
    setShowDropdown(false)
  }

  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: ['trades'] })
    qc.invalidateQueries({ queryKey: ['portfolio'] })
    onClose()
  }

  const createMut = useMutation({ mutationFn: createTrade, onSuccess })
  const updateMut = useMutation({
    mutationFn: (data: TradeCreate) => updateTrade(editing!.id, data),
    onSuccess,
  })

  const isPending = createMut.isPending || updateMut.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ticker) return
    if (editing) {
      updateMut.mutate(form)
    } else {
      createMut.mutate(form)
    }
  }

  const set = (field: keyof TradeCreate, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50 pb-16 md:pb-0"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:max-w-md p-6 max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">
            {editing ? '매매 수정' : '매매 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">시장</label>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {(['KR', 'US'] as MarketType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleMarketTypeChange(type)}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-sm font-medium transition-colors',
                    marketType === type
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {type === 'US' ? '해외 주식' : '국내 주식'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm text-gray-600 mb-1">종목</label>
            <input
              required
              value={stockQuery}
              onChange={(e) => {
                setStockQuery(e.target.value)
                setForm((prev) => ({ ...prev, ticker: '' }))
              }}
              placeholder={marketType === 'KR' ? '종목명 검색 (예: 삼성전자)' : '종목명 검색 (예: Apple)'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {serverLoading && (
              <p className="text-xs text-gray-400 mt-1">종목 데이터 로딩 중... 잠시 후 다시 검색해주세요.</p>
            )}
            {isSearching && !serverLoading && (
              <p className="text-xs text-gray-400 mt-1">검색 중...</p>
            )}
            {form.ticker && (
              <p className="text-xs text-indigo-600 mt-1">선택된 티커: {form.ticker} · {form.market}</p>
            )}
            {showDropdown && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
                {filteredResults.map((s) => (
                  <li
                    key={`${s.market}-${s.ticker}`}
                    onMouseDown={() => selectStock(s)}
                    className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">{s.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{s.ticker} · {s.market}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">구분</label>
            <select
              value={form.trade_type}
              onChange={(e) => set('trade_type', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="BUY">매수</option>
              <option value="SELL">매도</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">수량</label>
            <input
              required
              type="number"
              min={1}
              value={form.quantity || ''}
              onChange={(e) => set('quantity', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              단가 ({marketType === 'KR' ? '₩' : '$'})
            </label>
            <input
              required
              type="number"
              min={0}
              step={marketType === 'KR' ? '1' : '0.01'}
              value={form.price || ''}
              onChange={(e) => set('price', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">거래일 (선택)</label>
            <input
              type="date"
              value={form.trade_date ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, trade_date: e.target.value || null }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending || !form.ticker}
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
