import { useCallback, useState } from "react"

export type UseCacheKeyValue = {
  cacheKey: number
  updateCacheKey: () => void
}

export function useCacheKey(): UseCacheKeyValue {
  const [cacheKey, setCacheKey] = useState<number>(Date.now())
  const updateCacheKey = useCallback(() => {
    setCacheKey(Date.now())
  }, [])

  return {
    cacheKey,
    updateCacheKey,
  }
}
