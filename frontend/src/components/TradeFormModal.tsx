import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTrade, updateTrade, type Trade, type TradeCreate } from '@/api/trades'

interface Props {
  onClose: () => void
  editing?: Trade | null
}

const empty: TradeCreate = { ticker: '', trade_type: 'BUY', quantity: 0, price: 0 }

export default function TradeFormModal({ onClose, editing }: Props) {
  const qc = useQueryClient()
  const [form, setForm] = useState<TradeCreate>(empty)

  useEffect(() => {
    if (editing) {
      setForm({
        ticker: editing.ticker,
        trade_type: editing.trade_type,
        quantity: editing.quantity,
        price: editing.price,
      })
    }
  }, [editing])

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
    if (editing) {
      updateMut.mutate(form)
    } else {
      createMut.mutate(form)
    }
  }

  const set = (field: keyof TradeCreate, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
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
            <label className="block text-sm text-gray-600 mb-1">티커</label>
            <input
              required
              value={form.ticker}
              onChange={(e) => set('ticker', e.target.value.toUpperCase())}
              placeholder="예: AAPL"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
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
            <label className="block text-sm text-gray-600 mb-1">단가 ($)</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.price || ''}
              onChange={(e) => set('price', Number(e.target.value))}
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
              disabled={isPending}
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
