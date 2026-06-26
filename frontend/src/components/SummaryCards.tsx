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
      value: formatCurrency(summary.total_invested, summary.currency as 'USD' | 'KRW'),
      icon: Wallet,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      label: '평가 금액',
      value: formatCurrency(summary.total_evaluation, summary.currency as 'USD' | 'KRW'),
      icon: BarChart3,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: '총 손익',
      value: formatCurrency(summary.total_profit_loss, summary.currency as 'USD' | 'KRW'),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? 'text-red-600' : 'text-blue-600',
      bg: isProfit ? 'bg-red-50' : 'bg-blue-50',
    },
    {
      label: '수익률',
      value: formatPercent(summary.total_return_rate),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? 'text-red-600' : 'text-blue-600',
      bg: isProfit ? 'bg-red-50' : 'bg-blue-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <span className="text-xs md:text-sm text-gray-500">{label}</span>
            <div className={cn('p-1.5 md:p-2 rounded-lg', bg)}>
              <Icon size={14} className={color} />
            </div>
          </div>
          <p className={cn('text-base md:text-xl font-semibold truncate', color)}>{value}</p>
        </div>
      ))}
    </div>
  )
}
