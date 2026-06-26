import { useState } from 'react'

const STORAGE_KEY = 'apply_fees'

export function useApplyFees() {
  const [applyFees, setApplyFeesState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  const setApplyFees = (value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value))
    setApplyFeesState(value)
  }

  return { applyFees, setApplyFees }
}
