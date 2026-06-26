import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTrade, type Trade } from '@/api/trades'
import { cn, formatCurrency } from '@/lib/utils'
import TradeFormModal from './TradeFormModal'

interface Props {
  trades: Trade[]
  stockNames?: Record<string, string>
}

const KR_MARKETS = ['KOSPI', 'KOSDAQ']

function currency(market: string) {
  return KR_MARKETS.includes(market) ? 'KRW' : 'USD'
}

export default function TradeTable({ trades, stockNames = {} }: Props) {
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

  if (trades.length === 0) {
    return <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">매매 기록이 없습니다.</div>
  }

  return (
    <>
      {/* 데스크탑 테이블 */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm bg-white">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-left">
              <th className="px-4 py-3 font-medium">종목</th>
              <th className="px-4 py-3 font-medium">구분</th>
              <th className="px-4 py-3 font-medium text-right">수량</th>
              <th className="px-4 py-3 font-medium text-right">단가</th>
              <th className="px-4 py-3 font-medium text-right">금액</th>
              <th className="px-4 py-3 font-medium">날짜</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{stockNames[t.ticker] ?? t.ticker}</div>
                  <div className="text-xs text-gray-400">{t.ticker}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold',
                    t.trade_type.toUpperCase() === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                    {t.trade_type.toUpperCase() === 'BUY' ? '매수' : '매도'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{t.quantity}주</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(t.price, currency(t.market))}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(t.quantity * t.price, currency(t.market))}</td>
                <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                  {t.trade_date ?? <span className="text-gray-300">-</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(t)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(t)} disabled={deleteMut.isPending} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 리스트 */}
      <div className="md:hidden space-y-2">
        {trades.map((t) => {
          const isBuy = t.trade_type.toUpperCase() === 'BUY'
          const cur = currency(t.market)
          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{stockNames[t.ticker] ?? t.ticker}</span>
                  <span className="text-xs text-gray-400 ml-1.5">{t.ticker}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold',
                    isBuy ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                    {isBuy ? '매수' : '매도'}
                  </span>
                  <button onClick={() => handleEdit(t)} className="p-1 text-gray-400 hover:text-indigo-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(t)} disabled={deleteMut.isPending} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 text-xs text-gray-500">
                <div>
                  <p className="mb-0.5">수량</p>
                  <p className="font-medium text-gray-800">{t.quantity}주</p>
                </div>
                <div>
                  <p className="mb-0.5">단가</p>
                  <p className="font-medium text-gray-800">{formatCurrency(t.price, cur)}</p>
                </div>
                <div>
                  <p className="mb-0.5">금액</p>
                  <p className="font-medium text-gray-800">{formatCurrency(t.quantity * t.price, cur)}</p>
                </div>
              </div>

              {t.trade_date && (
                <p className="text-xs text-gray-400 mt-2">{t.trade_date}</p>
              )}
            </div>
          )
        })}
      </div>

      {showModal && (
        <TradeFormModal
          editing={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}
    </>
  )
}
