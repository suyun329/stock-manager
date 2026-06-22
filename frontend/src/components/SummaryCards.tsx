import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { PortfolioSummary } from '@/api/portfolio'

interface Props {
  summary: PortfolioSummary
}

export default function SummaryCards({ summary }: Props) {
  const isProfit = summary.total_profit_loss >= 0

  const cards = [
    {
      label: '총 투자금',
      value: formatCurrency(summary.total_invested),
      icon: Wallet,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      label: '평가 금액',
      value: formatCurrency(summary.total_evaluation),
      icon: BarChart3,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: '총 손익',
      value: formatCurrency(summary.total_profit_loss),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? 'text-emerald-600' : 'text-red-500',
      bg: isProfit ? 'bg-emerald-50' : 'bg-red-50',
    },
    {
      label: '수익률',
      value: formatPercent(summary.total_return_rate),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? 'text-emerald-600' : 'text-red-500',
      bg: isProfit ? 'bg-emerald-50' : 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{label}</span>
            <div className={cn('p-2 rounded-lg', bg)}>
              <Icon size={16} className={color} />
            </div>
          </div>
          <p className={cn('text-xl font-semibold', color)}>{value}</p>
        </div>
      ))}
    </div>
  )
}
