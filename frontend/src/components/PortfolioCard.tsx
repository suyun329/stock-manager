import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { PortfolioItem } from '@/api/portfolio'

interface Props {
  item: PortfolioItem
}

export default function PortfolioCard({ item }: Props) {
  const navigate = useNavigate()
  const isProfit = item.profit_rate >= 0

  return (
    <div
      onClick={() => navigate(`/portfolio/${item.ticker}`)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{item.ticker}</h3>
          <p className="text-sm text-gray-400">{item.quantity}주 보유</p>
        </div>
        <div className={cn('flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg', isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500')}>
          {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {formatPercent(item.profit_rate)}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>평가 금액</span>
          <span className="font-medium text-gray-800">{formatCurrency(item.evaluation_amount)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>투자 원금</span>
          <span className="font-medium text-gray-800">{formatCurrency(item.invested_amount)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>손익</span>
          <span className={cn('font-semibold', isProfit ? 'text-emerald-600' : 'text-red-500')}>
            {formatCurrency(item.profit_loss)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end text-indigo-500 text-xs font-medium gap-1">
        상세 보기 <ChevronRight size={14} />
      </div>
    </div>
  )
}
