import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">로그인</h1>
        <p className="text-sm text-gray-400 mb-6">Stock Manager에 오신 걸 환영합니다</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">아이디</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">비밀번호</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
