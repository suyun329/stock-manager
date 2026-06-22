import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTrade, type Trade } from '@/api/trades'
import { cn } from '@/lib/utils'
import TradeFormModal from './TradeFormModal'

interface Props {
  trades: Trade[]
}

export default function TradeTable({ trades }: Props) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Trade | null>(null)
  const [showModal, setShowModal] = useState(false)

  const deleteMut = useMutation({
    mutationFn: deleteTrade,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades'] })
      qc.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })

  const handleDelete = (trade: Trade) => {
    if (confirm(`${trade.ticker} 매매 기록을 삭제할까요?`)) {
      deleteMut.mutate(trade.id)
    }
  }

  const handleEdit = (trade: Trade) => {
    setEditing(trade)
    setShowModal(true)
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm bg-white">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-left">
              <th className="px-4 py-3 font-medium">티커</th>
              <th className="px-4 py-3 font-medium">구분</th>
              <th className="px-4 py-3 font-medium text-right">수량</th>
              <th className="px-4 py-3 font-medium text-right">단가</th>
              <th className="px-4 py-3 font-medium text-right">금액</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{t.ticker}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-semibold',
                      t.trade_type.toUpperCase() === 'BUY'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-600',
                    )}
                  >
                    {t.trade_type.toUpperCase() === 'BUY' ? '매수' : '매도'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{t.quantity}주</td>
                <td className="px-4 py-3 text-right text-gray-700">${t.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  ${(t.quantity * t.price).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={deleteMut.isPending}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {trades.length === 0 && (
          <div className="text-center py-16 text-gray-400">매매 기록이 없습니다.</div>
        )}
      </div>

      {showModal && (
        <TradeFormModal
          editing={editing}
          onClose={() => {
            setShowModal(false)
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
