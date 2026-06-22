import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import TradesPage from '@/pages/TradesPage'
import StockDetailPage from '@/pages/StockDetailPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/trades" element={<TradesPage />} />
            <Route path="/portfolio/:ticker" element={<StockDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
