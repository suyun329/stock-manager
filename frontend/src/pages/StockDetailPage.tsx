import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { getPortfolioByTicker } from '@/api/portfolio'
import { getTrades } from '@/api/trades'
import { getStockNames } from '@/api/stocks'
import AIFeedbackCard from '@/components/AIFeedbackCard'
import TradeTable from '@/components/TradeTable'
import { cn, formatCurrency, formatPercent, applyFeesToPortfolio } from '@/lib/utils'
import { useApplyFees } from '@/hooks/useApplyFees'

export default function StockDetailPage() {
  const { ticker = '' } = useParams()
  const navigate = useNavigate()
  const { applyFees, setApplyFees } = useApplyFees()

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', ticker],
    queryFn: () => getPortfolioByTicker(ticker),
    enabled: !!ticker,
  })

  const { data: allTrades } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
  })

  const { data: stockNames = {} } = useQuery({
    queryKey: ['stock-names', [ticker]],
    queryFn: () => getStockNames([ticker]),
    enabled: !!ticker,
  })

  const tickerTrades = allTrades?.filter(
    (t) => t.ticker.toUpperCase() === ticker.toUpperCase(),
  ) ?? []

  const displayPortfolio = portfolio
    ? (applyFees ? applyFeesToPortfolio(portfolio) : portfolio)
    : null

  const isProfit = (displayPortfolio?.profit_rate ?? 0) >= 0
  const currency = portfolio?.currency as 'USD' | 'KRW' ?? 'USD'
  const stockName = stockNames[ticker]

  const stats = displayPortfolio
    ? [
        { label: '현재가', value: formatCurrency(displayPortfolio.current_price, currency) },
        { label: '평균 단가', value: formatCurrency(displayPortfolio.avg_buy_price, currency) },
        { label: '보유 수량', value: `${displayPortfolio.quantity}주` },
        { label: '투자 원금', value: formatCurrency(displayPortfolio.invested_amount, currency) },
        { label: '평가 금액', value: formatCurrency(displayPortfolio.evaluation_amount, currency) },
        { label: '손익', value: formatCurrency(displayPortfolio.profit_loss, currency), colored: true },
      ]
    : []

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> 뒤로가기
      </button>

      {isLoading ? (
        <div className="h-40 bg-white rounded-xl border border-gray-100 animate-pulse" />
      ) : displayPortfolio ? (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
            <div className="flex items-start justify-between mb-4 md:mb-5">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                  {stockName ?? ticker}
                </h1>
                {stockName && (
                  <p className="text-xs md:text-sm text-gray-400 mt-0.5">{ticker} · {portfolio!.market}</p>
                )}
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-base md:text-lg font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg',
                  isProfit ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600',
                )}
              >
                {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {formatPercent(displayPortfolio.profit_rate)}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.map(({ label, value, colored }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className={cn('font-semibold text-sm md:text-base truncate',
                    colored ? isProfit ? 'text-red-600' : 'text-blue-600' : 'text-gray-900')}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* 수수료/세금 체크박스 — 카드 하단 */}
            <div className="border-t border-gray-100 mt-4 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyFees}
                  onChange={(e) => setApplyFees(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">세금 및 수수료 적용</span>
              </label>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                {applyFees
                  ? '예상 세금 및 수수료가 적용 되었습니다. 실제 수익은 증권사를 통해 확인하시기 바랍니다.'
                  : '세금 및 거래 수수료는 반영되지 않습니다. 실제 수익은 증권사를 통해 확인하시기 바랍니다.'}
              </p>
            </div>
          </div>

          <AIFeedbackCard ticker={ticker} />

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">매매 이력</h2>
            <TradeTable trades={tickerTrades} stockNames={stockNames} />
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">종목을 찾을 수 없습니다.</div>
      )}
    </div>
  )
}
