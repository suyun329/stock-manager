import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTrades } from '@/api/trades'
import { getStockNames } from '@/api/stocks'
import TradeTable from '@/components/TradeTable'
import TradeFormModal from '@/components/TradeFormModal'
import { cn } from '@/lib/utils'

type MarketTab = 'US' | 'KR'

const TABS: { key: MarketTab; label: string }[] = [
  { key: 'KR', label: '국내 주식' },
  { key: 'US', label: '해외 주식' },
]

const KR_MARKETS = ['KOSPI', 'KOSDAQ']

export default function TradesPage() {
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<MarketTab>('KR')

  const { data: trades, isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
  })

  const filteredTrades = trades?.filter((t) =>
    activeTab === 'KR' ? KR_MARKETS.includes(t.market) : !KR_MARKETS.includes(t.market)
  ) ?? []

  const uniqueTickers = [...new Set(filteredTrades.map((t) => t.ticker))]
  const { data: stockNames = {} } = useQuery({
    queryKey: ['stock-names', uniqueTickers],
    queryFn: () => getStockNames(uniqueTickers),
    enabled: uniqueTickers.length > 0,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매매 내역</h1>
          <p className="text-sm text-gray-400 mt-1">
            {filteredTrades.length > 0 ? `총 ${filteredTrades.length}건` : '매매 기록이 없습니다'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          매매 추가
        </button>
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

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
      ) : (
        <TradeTable trades={filteredTrades} stockNames={stockNames} />
      )}

      {showModal && <TradeFormModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
