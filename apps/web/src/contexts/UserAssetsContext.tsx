import { useCallback, type ReactNode } from 'react'
import { AppStoreProvider, useAppStore } from './AppStoreContext'

export type UserAssetStatus = '已收录 (待确认)' | '已收录 (由我管理)'

export interface UserAsset {
  id: string
  dialect: string
  duration: number
  timestamp: string
  status: UserAssetStatus
  title?: string
  audioUrl?: string
  audioBlob?: Blob
  sourceAssetId?: string
}

/** @deprecated AppStoreProvider now owns the asset state. Kept as a transparent compatibility wrapper. */
export function UserAssetsProvider({ children }: { children: ReactNode }) {
  return <AppStoreProvider>{children}</AppStoreProvider>
}

export function useUserAssets() {
  const { state, actions } = useAppStore()

  const removeAsset = useCallback((assetId: string) => {
    const removed = state.userAssets.find((asset) => asset.id === assetId)
    if (removed?.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(removed.audioUrl)
    actions.removeAsset(assetId)
  }, [actions, state.userAssets])

  return {
    userAssets: state.userAssets,
    appendAsset: actions.addAsset,
    removeAsset,
    updateAsset: actions.updateAsset,
    hydrateAssets: actions.hydrateAssets,
  }
}
