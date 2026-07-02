import { useEffect, useState } from 'react'
import { BottomNav, type TabId } from './components/layouts'
import { AppOnboardingModal, AssetDetailSheet } from './components/modals'
import { Brand, Toast } from './components/ui'
import { useAppStore, type UserAsset } from './contexts'
import { acceptOffer, claimTask, confirmVoiceMint, createRecording, deleteVoiceAsset, getOverview, revokeAssetSovereignty } from './lib/api'
import { uploadVoiceAudio, type AudioUploadResult } from './services/api'
import { AssetsScreen } from './screens/AssetsScreen'
import { CommunityScreen } from './screens/CommunityScreen'
import { RecordScreen } from './screens/RecordScreen'
import { RevenueScreen } from './screens/RevenueScreen'
import type { MintLicenseTier, Overview, VoiceAsset, VoiceTask } from './types'

export default function App() {
  const { state: appState, actions: appActions } = useAppStore()
  const [data, setData] = useState<Overview | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<VoiceAsset | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('ouvoice:onboarding:v1') !== 'seen'
  })

  useEffect(() => {
    let active = true
    void getOverview().then((overview) => {
      if (!active) return
      setData(overview)
      appActions.setTotalEarnings(overview.balance)
      appActions.hydrateAssets(overview.assets.map((asset) => ({
        id: asset.serial,
        dialect: asset.dialect,
        duration: asset.duration,
        timestamp: asset.createdAt,
        status: asset.status === 'REVIEWING' ? '已收录 (待确认)' : '已收录 (由我管理)',
        title: asset.title,
        audioUrl: asset.audioUrl,
        sourceAssetId: asset.id,
      })))
    })
    return () => { active = false }
  }, [appActions])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  function navigate(next: TabId) {
    appActions.setCurrentTab(next)
    scrollAppToTop()
  }

  function closeOnboarding() {
    window.localStorage.setItem('ouvoice:onboarding:v1', 'seen')
    setIsOnboardingOpen(false)
  }

  function completeOnboarding() {
    closeOnboarding()
    navigate('record')
  }

  async function activateBountyTask(task: VoiceTask) {
    appActions.setActiveBountyTask(task)
    appActions.setCurrentTab('record')
    scrollAppToTop()
    try { await claimTask(task.id) } catch { /* demo mode stays usable */ }
  }

  async function submitRecording(input: {
    taskId?: string
    title: string
    duration: number
    dialectTag: string
    audioBlob: Blob | null
    allowShortArchive: boolean
  }) {
    let uploadedAudio: AudioUploadResult | null = null
    if (input.audioBlob) {
      try {
        uploadedAudio = await uploadVoiceAudio({
          file: input.audioBlob,
          userId: data?.profile.id || 'local-user',
          dialectTag: input.dialectTag,
          allowShortArchive: input.allowShortArchive,
        })
      } catch {
        // Offline/local preview remains usable; the captured Blob is kept in the global asset store.
      }
    }

    const result = await createRecording({
      taskId: input.taskId,
      title: input.title,
      duration: uploadedAudio?.duration ?? input.duration,
    })
    const asset = uploadedAudio ? {
      ...result.asset,
      id: `asset-${uploadedAudio.asset_id}`,
      serial: uploadedAudio.asset_id,
      fingerprint: uploadedAudio.fingerprint,
      duration: uploadedAudio.duration,
    } : result.asset
    setData((current) => current ? {
      ...current,
      pending: current.pending + result.reward,
      assets: [asset, ...current.assets],
    } : current)
    setToast(`提交成功，¥${result.reward} 奖励将在质检后结算`)
    return asset
  }

  async function handleAccept(asset: VoiceAsset) {
    if (!asset.offer || !data) return
    setAccepting(true)
    try {
      const result = await acceptOffer(asset.id, asset.offer.id)
      setData({ ...data, balance: result.balance, assets: data.assets.map((item) => item.id === asset.id ? result.asset : item) })
      appActions.incrementEarnings(asset.offer.amount)
      setSelectedAsset(result.asset)
      setToast(`授权签署成功，¥${asset.offer.amount} 已进入账户`)
    } catch {
      const accepted = { ...asset, licenses: asset.licenses + 1, revenue: asset.revenue + asset.offer.amount, offer: { ...asset.offer, status: 'ACCEPTED' as const } }
      const nextBalance = data.balance + asset.offer.amount
      setData({ ...data, balance: nextBalance, assets: data.assets.map((item) => item.id === asset.id ? accepted : item) })
      appActions.incrementEarnings(asset.offer.amount)
      setSelectedAsset(accepted)
      setToast('授权已签署（演示模式）')
    } finally {
      setAccepting(false)
    }
  }

  async function handleMint(asset: VoiceAsset, tier: MintLicenseTier) {
    const result = await confirmVoiceMint(asset, tier)
    setData((current) => current ? { ...current, assets: current.assets.map((item) => item.id === asset.id ? result.asset : item) } : current)
    setToast(`${result.asset.serial} 已保存到我的声库`)
    return result
  }

  async function handleSovereigntyRevoke(asset: VoiceAsset) {
    const result = await revokeAssetSovereignty(asset)
    setData((current) => current ? { ...current, assets: current.assets.map((item) => item.id === asset.id ? result.asset : item) } : current)
    return result
  }

  async function handleDeleteAsset(asset: UserAsset) {
    const sourceAsset = data?.assets.find((item) => item.id === asset.sourceAssetId || item.serial === asset.id)
    if (sourceAsset) {
      await deleteVoiceAsset(sourceAsset.id)
      setData((current) => current ? { ...current, assets: current.assets.filter((item) => item.id !== sourceAsset.id) } : current)
      setSelectedAsset((current) => current?.id === sourceAsset.id ? null : current)
    }
    setToast(`${asset.id} 已从声库删除`)
  }

  function inspectUserAsset(asset: UserAsset) {
    const sourceAsset = data?.assets.find((item) => item.id === asset.sourceAssetId || item.serial === asset.id)
    if (sourceAsset) setSelectedAsset(sourceAsset)
  }

  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setToast('记录编号已复制') } catch { setToast(value) }
  }

  if (!data) return (
    <main className="app-shell ou-warm boot-screen">
      <div className="boot-rings"><span /><span /><span /></div>
      <Brand />
      <p>正在安全连接原声资产网络</p>
      <div className="boot-progress"><i /></div>
    </main>
  )

  return (
    <main className="app-shell ou-warm flex min-h-0 flex-col">
      <div className="ambient ambient--gold" /><div className="ambient ambient--teal" />
      <div className="app-content h-[calc(100vh-140px)] flex-1 overflow-y-auto pb-24" data-testid="app-scroll-container">
        <div className={appState.currentTab === 'record' ? 'h-full' : 'hidden'} aria-hidden={appState.currentTab !== 'record'}>
          <RecordScreen task={appState.activeBountyTask ?? undefined} onBack={() => navigate('vault')} onSubmit={submitRecording} onMint={handleMint} onOpenGuide={() => setIsOnboardingOpen(true)} standalone />
        </div>
        <div className={appState.currentTab === 'vault' ? 'h-full' : 'hidden'} aria-hidden={appState.currentTab !== 'vault'}>
          <AssetsScreen onInspect={inspectUserAsset} onDelete={handleDeleteAsset} />
        </div>
        <div className={appState.currentTab === 'community' ? 'h-full' : 'hidden'} aria-hidden={appState.currentTab !== 'community'}>
          <CommunityScreen tasks={data.tasks} onTask={(task) => void activateBountyTask(task)} />
        </div>
        <div className={appState.currentTab === 'assets' ? 'h-full' : 'hidden'} aria-hidden={appState.currentTab !== 'assets'}>
          <RevenueScreen data={data} onToast={setToast} onRevoke={handleSovereigntyRevoke} />
        </div>
      </div>
      <BottomNav current={appState.currentTab} onChange={navigate} />
      <AppOnboardingModal open={isOnboardingOpen} onClose={closeOnboarding} onComplete={completeOnboarding} />
      {selectedAsset && <AssetDetailSheet asset={selectedAsset} accepting={accepting} onClose={() => setSelectedAsset(null)} onAccept={handleAccept} onCopy={copy} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  )
}

function scrollAppToTop() {
  window.requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('.app-content')?.scrollTo({ top: 0, behavior: 'smooth' })
    document.querySelectorAll<HTMLElement>('[data-testid="revenue-scroll-container"], [data-testid="vault-asset-list"]').forEach((element) => {
      element.scrollTo({ top: 0, behavior: 'smooth' })
    })
  })
}
