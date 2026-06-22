import { useState } from 'react'
import { Bot, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAIFeedback } from '@/api/feedback'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface Props {
  ticker: string
}

export default function AIFeedbackCard({ ticker }: Props) {
  const [enabled, setEnabled] = useState(false)

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['ai-feedback', ticker],
    queryFn: () => getAIFeedback(ticker),
    enabled,
  })

  const handleClick = () => {
    if (!enabled) {
      setEnabled(true)
    } else {
      refetch()
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Bot size={18} className="text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-900">AI 투자 피드백</h2>
        </div>
        <button
          onClick={handleClick}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
          {data ? '새로고침' : '피드백 받기'}
        </button>
      </div>

      {isFetching && (
        <div className="text-sm text-gray-400 animate-pulse">분석 중...</div>
      )}

      {data && !isFetching && (
        <div className="bg-indigo-50 rounded-lg px-4 py-3 text-sm text-indigo-900 leading-relaxed prose prose-sm prose-indigo max-w-none">
          <ReactMarkdown>{data.feedback}</ReactMarkdown>
        </div>
      )}

      {!data && !isFetching && (
        <p className="text-sm text-gray-400">버튼을 눌러 이 종목의 투자 습관을 분석해보세요.</p>
      )}
    </div>
  )
}
