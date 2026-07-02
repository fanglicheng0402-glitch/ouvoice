import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { demoOverview } from '../data/demo'
import type { VoiceTask } from '../types'
import type { UserAsset } from './UserAssetsContext'

export type AppTab = 'record' | 'vault' | 'community' | 'assets'

export interface AppStoreState {
  currentTab: AppTab
  userAssets: UserAsset[]
  totalEarnings: number
  activeBountyTask: VoiceTask | null
}

export type AppStoreAction =
  | { type: 'SET_TAB'; payload: AppTab }
  | { type: 'HYDRATE_ASSETS'; payload: UserAsset[] }
  | { type: 'ADD_ASSET'; payload: UserAsset }
  | { type: 'UPDATE_ASSET'; payload: { assetId: string; update: Partial<UserAsset> } }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'SET_TOTAL_EARNINGS'; payload: number }
  | { type: 'INCREMENT_EARNINGS'; payload: number }
  | { type: 'SET_ACTIVE_BOUNTY_TASK'; payload: VoiceTask | null }

const mockUserAssets: UserAsset[] = demoOverview.assets.map((asset) => ({
  id: asset.serial,
  dialect: asset.dialect,
  duration: asset.duration,
  timestamp: asset.createdAt,
  status: asset.status === 'REVIEWING' ? '已收录 (待确认)' : '已收录 (由我管理)',
  title: asset.title,
  audioUrl: asset.audioUrl,
  sourceAssetId: asset.id,
}))

export const initialAppStoreState: AppStoreState = {
  currentTab: 'record',
  userAssets: mockUserAssets,
  totalEarnings: demoOverview.balance,
  activeBountyTask: null,
}

export function appStoreReducer(state: AppStoreState, action: AppStoreAction): AppStoreState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, currentTab: action.payload }
    case 'HYDRATE_ASSETS': {
      const assets = new Map(state.userAssets.map((asset) => [asset.id, asset]))
      action.payload.forEach((asset) => { if (!assets.has(asset.id)) assets.set(asset.id, asset) })
      return { ...state, userAssets: [...assets.values()] }
    }
    case 'ADD_ASSET':
      return { ...state, userAssets: [action.payload, ...state.userAssets.filter((asset) => asset.id !== action.payload.id)] }
    case 'UPDATE_ASSET':
      return { ...state, userAssets: state.userAssets.map((asset) => asset.id === action.payload.assetId ? { ...asset, ...action.payload.update } : asset) }
    case 'REMOVE_ASSET':
      return { ...state, userAssets: state.userAssets.filter((asset) => asset.id !== action.payload) }
    case 'SET_TOTAL_EARNINGS':
      return { ...state, totalEarnings: Number(action.payload.toFixed(2)) }
    case 'INCREMENT_EARNINGS':
      return { ...state, totalEarnings: Number((state.totalEarnings + action.payload).toFixed(2)) }
    case 'SET_ACTIVE_BOUNTY_TASK':
      return { ...state, activeBountyTask: action.payload }
    default:
      return state
  }
}

interface AppStoreActions {
  setCurrentTab: (tab: AppTab) => void
  hydrateAssets: (assets: UserAsset[]) => void
  addAsset: (asset: UserAsset) => void
  updateAsset: (assetId: string, update: Partial<UserAsset>) => void
  removeAsset: (assetId: string) => void
  setTotalEarnings: (amount: number) => void
  incrementEarnings: (amount: number) => void
  setActiveBountyTask: (task: VoiceTask | null) => void
}

interface AppStoreContextValue {
  state: AppStoreState
  dispatch: Dispatch<AppStoreAction>
  actions: AppStoreActions
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appStoreReducer, initialAppStoreState)
  const actions = useMemo<AppStoreActions>(() => ({
    setCurrentTab: (tab) => dispatch({ type: 'SET_TAB', payload: tab }),
    hydrateAssets: (assets) => dispatch({ type: 'HYDRATE_ASSETS', payload: assets }),
    addAsset: (asset) => dispatch({ type: 'ADD_ASSET', payload: asset }),
    updateAsset: (assetId, update) => dispatch({ type: 'UPDATE_ASSET', payload: { assetId, update } }),
    removeAsset: (assetId) => dispatch({ type: 'REMOVE_ASSET', payload: assetId }),
    setTotalEarnings: (amount) => dispatch({ type: 'SET_TOTAL_EARNINGS', payload: amount }),
    incrementEarnings: (amount) => dispatch({ type: 'INCREMENT_EARNINGS', payload: amount }),
    setActiveBountyTask: (task) => dispatch({ type: 'SET_ACTIVE_BOUNTY_TASK', payload: task }),
  }), [])

  const value = useMemo(() => ({ state, dispatch, actions }), [actions, state])
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) throw new Error('useAppStore must be used inside AppStoreProvider')
  return context
}
