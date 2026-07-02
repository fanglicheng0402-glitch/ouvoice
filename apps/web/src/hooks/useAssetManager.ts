import { useCallback, useMemo, useState } from 'react'
import type { VoiceAsset } from '../types'

export function useAssetManager(initialAssets: VoiceAsset[] = []) {
  const [assets, setAssets] = useState<VoiceAsset[]>(initialAssets)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(initialAssets[0]?.id ?? null)

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )

  const addAsset = useCallback((asset: VoiceAsset) => {
    setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)])
    setSelectedAssetId(asset.id)
  }, [])

  const updateAsset = useCallback((assetId: string, update: Partial<VoiceAsset>) => {
    setAssets((current) => current.map((asset) => asset.id === assetId ? { ...asset, ...update } : asset))
  }, [])

  const removeAsset = useCallback((assetId: string) => {
    setAssets((current) => current.filter((asset) => asset.id !== assetId))
    setSelectedAssetId((current) => current === assetId ? null : current)
  }, [])

  const replaceAssets = useCallback((nextAssets: VoiceAsset[]) => {
    setAssets(nextAssets)
    setSelectedAssetId((current) => nextAssets.some((asset) => asset.id === current) ? current : nextAssets[0]?.id ?? null)
  }, [])

  return { assets, selectedAsset, selectedAssetId, selectAsset: setSelectedAssetId, addAsset, updateAsset, removeAsset, replaceAssets }
}
