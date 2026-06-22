import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTrades } from '@/api/trades'
import TradeTable from '@/components/TradeTable'
import TradeFormModal from '@/components/TradeFormModal'

export default function TradesPage() {
  const [showModal, setShowModal] = useState(false)

  const { data: trades, isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매매 내역</h1>
          <p className="text-sm text-gray-400 mt-1">
            {trades ? `총 ${trades.length}건` : '불러오는 중...'}
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

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
      ) : (
        <TradeTable trades={trades ?? []} />
      )}

      {showModal && <TradeFormModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
