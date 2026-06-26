import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: 'USD' | 'KRW' = 'USD'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

const KR_MARKETS = ['KOSPI', 'KOSDAQ']
const KR_COMMISSION = 0.00015  // 매수·매도 각 0.015%
const US_COMMISSION = 0.0025   // 매수·매도 각 0.25%
const KR_TAX = 0.0018          // 국내 거래세 0.18% (매도 시)

export function applyFeesToPortfolio<T extends { market: string; invested_amount: number; evaluation_amount: number; profit_loss: number; profit_rate: number }>(item: T): T {
  const isKR = KR_MARKETS.includes(item.market)
  const commission = isKR ? KR_COMMISSION : US_COMMISSION
  const buyFee = item.invested_amount * commission
  const sellFee = item.evaluation_amount * commission
  const tax = isKR ? item.evaluation_amount * KR_TAX : 0
  const adjustedEvaluation = item.evaluation_amount - sellFee - tax
  const adjustedProfitLoss = item.profit_loss - buyFee - sellFee - tax
  const adjustedProfitRate =
    item.invested_amount > 0 ? (adjustedProfitLoss / item.invested_amount) * 100 : 0
  return {
    ...item,
    evaluation_amount: Math.round(adjustedEvaluation * 100) / 100,
    profit_loss: Math.round(adjustedProfitLoss * 100) / 100,
    profit_rate: Math.round(adjustedProfitRate * 100) / 100,
  }
}
