import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllPortfolios, getPortfolioSummary } from '@/api/portfolio'
import { getStockNames } from '@/api/stocks'
import SummaryCards from '@/components/SummaryCards'
import PortfolioCard from '@/components/PortfolioCard'
import { cn } from '@/lib/utils'

type MarketTab = 'US' | 'KR'

const TABS: { key: MarketTab; label: string }[] = [
  { key: 'KR', label: '국내 주식' },
  { key: 'US', label: '해외 주식' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<MarketTab>('KR')

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['portfolio', 'summary', activeTab],
    queryFn: () => getPortfolioSummary(activeTab),
  })

  const { data: portfolios, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', 'all', activeTab],
    queryFn: () => getAllPortfolios(activeTab),
  })

  const { data: stockNames = {} } = useQuery({
    queryKey: ['stock-names', portfolios?.map((p) => p.ticker)],
    queryFn: () => getStockNames(portfolios!.map((p) => p.ticker)),
    enabled: !!portfolios && portfolios.length > 0,
  })

  return (
    <div className="space-y-5 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">포트폴리오 현황</h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">실시간 주가 기준으로 계산됩니다. 세금 및 거래 수수료는 반영되지 않습니다.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-5 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <SummaryCards summary={summary} />
      ) : null}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">종목별 현황</h2>
        {portfolioLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-48 animate-pulse" />
            ))}
          </div>
        ) : portfolios && portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {portfolios.map((item) => (
              <PortfolioCard key={item.ticker} item={item} name={stockNames[item.ticker]} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            {activeTab === 'US' ? '해외 주식' : '국내 주식'} 매매 기록이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
