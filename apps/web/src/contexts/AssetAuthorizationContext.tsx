import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultAssetPermissions, sovereignRecallPermissions, type AssetPermissions } from '../lib/assetPermissions'
import { useUserAssets } from './UserAssetsContext'

interface AssetAuthorizationContextValue {
  permissionsByAsset: Record<string, AssetPermissions>
  getPermissions: (assetId: string) => AssetPermissions
  togglePermission: (assetId: string, permission: keyof AssetPermissions) => void
  setAssetPermissions: (assetId: string, permissions: AssetPermissions) => void
  recallAsset: (assetId: string) => void
  enableExternalUsage: (assetId: string) => void
  isRecalled: (assetId: string) => boolean
}

const AssetAuthorizationContext = createContext<AssetAuthorizationContextValue | null>(null)

export function AssetAuthorizationProvider({ children }: { children: ReactNode }) {
  const { userAssets } = useUserAssets()
  const [permissionsByAsset, setPermissionsByAsset] = useState<Record<string, AssetPermissions>>({})
  const [recalledAssetIds, setRecalledAssetIds] = useState<string[]>([])

  useEffect(() => {
    setPermissionsByAsset((current) => {
      const next = { ...current }
      userAssets.forEach((asset) => { if (!next[asset.id]) next[asset.id] = { ...defaultAssetPermissions } })
      return next
    })
  }, [userAssets])

  const getPermissions = useCallback((assetId: string) => permissionsByAsset[assetId] ?? defaultAssetPermissions, [permissionsByAsset])

  const togglePermission = useCallback((assetId: string, permission: keyof AssetPermissions) => {
    if (recalledAssetIds.includes(assetId) && permission !== 'privateStorage') return
    setPermissionsByAsset((current) => {
      const permissions = current[assetId] ?? defaultAssetPermissions
      return { ...current, [assetId]: { ...permissions, [permission]: !permissions[permission] } }
    })
  }, [recalledAssetIds])

  const setAssetPermissions = useCallback((assetId: string, permissions: AssetPermissions) => {
    setPermissionsByAsset((current) => ({ ...current, [assetId]: { ...permissions } }))
  }, [])

  const recallAsset = useCallback((assetId: string) => {
    setPermissionsByAsset((current) => ({ ...current, [assetId]: { ...sovereignRecallPermissions } }))
    setRecalledAssetIds((current) => current.includes(assetId) ? current : [...current, assetId])
  }, [])

  const enableExternalUsage = useCallback((assetId: string) => {
    setPermissionsByAsset((current) => ({ ...current, [assetId]: { ...defaultAssetPermissions } }))
    setRecalledAssetIds((current) => current.filter((id) => id !== assetId))
  }, [])

  const isRecalled = useCallback((assetId: string) => recalledAssetIds.includes(assetId), [recalledAssetIds])
  const value = useMemo(() => ({ permissionsByAsset, getPermissions, togglePermission, setAssetPermissions, recallAsset, enableExternalUsage, isRecalled }), [enableExternalUsage, getPermissions, isRecalled, permissionsByAsset, recallAsset, setAssetPermissions, togglePermission])

  return <AssetAuthorizationContext.Provider value={value}>{children}</AssetAuthorizationContext.Provider>
}

export function useAssetAuthorization() {
  const context = useContext(AssetAuthorizationContext)
  if (!context) throw new Error('useAssetAuthorization must be used inside AssetAuthorizationProvider')
  return context
}
