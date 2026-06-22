import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { getPortfolioByTicker } from '@/api/portfolio'
import { getTrades } from '@/api/trades'
import AIFeedbackCard from '@/components/AIFeedbackCard'
import TradeTable from '@/components/TradeTable'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'

export default function StockDetailPage() {
  const { ticker = '' } = useParams()
  const navigate = useNavigate()

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', ticker],
    queryFn: () => getPortfolioByTicker(ticker),
    enabled: !!ticker,
  })

  const { data: allTrades } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
  })

  const tickerTrades = allTrades?.filter(
    (t) => t.ticker.toUpperCase() === ticker.toUpperCase(),
  ) ?? []

  const isProfit = (portfolio?.profit_rate ?? 0) >= 0

  const stats = portfolio
    ? [
        { label: '현재가', value: formatCurrency(portfolio.current_price) },
        { label: '평균 단가', value: formatCurrency(portfolio.avg_buy_price) },
        { label: '보유 수량', value: `${portfolio.quantity}주` },
        { label: '투자 원금', value: formatCurrency(portfolio.invested_amount) },
        { label: '평가 금액', value: formatCurrency(portfolio.evaluation_amount) },
        {
          label: '손익',
          value: formatCurrency(portfolio.profit_loss),
          colored: true,
        },
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
      ) : portfolio ? (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{ticker}</h1>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1.5 text-lg font-bold px-3 py-1.5 rounded-lg',
                  isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
                )}
              >
                {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                {formatPercent(portfolio.profit_rate)}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.map(({ label, value, colored }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p
                    className={cn(
                      'font-semibold text-base',
                      colored
                        ? isProfit ? 'text-emerald-600' : 'text-red-500'
                        : 'text-gray-900',
                    )}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <AIFeedbackCard ticker={ticker} />

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">매매 이력</h2>
            <TradeTable trades={tickerTrades} />
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">종목을 찾을 수 없습니다.</div>
      )}
    </div>
  )
}
