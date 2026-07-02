import { AlertOctagon, BrainCircuit, ChevronDown, CircleDollarSign, Coins, DatabaseZap, FlaskConical, GlobeLock, HandHeart, LoaderCircle, LockKeyhole, TrendingUp, UserCheck, UserRoundX, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore, useAssetAuthorization, useUserAssets } from '../contexts'
import { calculateCurrentAssetRate, maximumAssetAuthorizationValue, permissionRates, type AssetPermissions } from '../lib/assetPermissions'
import { formatMoney } from '../lib/format'
import type { Overview, SovereigntyRevocationReceipt, VoiceAsset } from '../types'

const controls: { id: keyof AssetPermissions; label: string; english: string; note: string; icon: typeof GlobeLock; rate: number }[] = [
  { id: 'privateStorage', label: '只放在我的声库里', english: '自己保存', note: '别人看不到，也不能搜索到', icon: GlobeLock, rate: 0 },
  { id: 'culturalHeritage', label: '用于方言文化保护', english: '公益使用', note: '支持非商业的方言保护计划', icon: HandHeart, rate: permissionRates.culturalHeritage },
  { id: 'academicUse', label: '用于高校和科研', english: '学术研究', note: '允许经过审核的学校和研究机构使用', icon: FlaskConical, rate: permissionRates.academicUse },
  { id: 'commercialTraining', label: '用于商业 AI 训练', english: '商业使用', note: '每次使用都会为你带来回馈', icon: BrainCircuit, rate: permissionRates.commercialTraining },
]

export function RevenueScreen({ data, onToast, onRevoke }: {
  data: Overview
  onToast: (message: string) => void
  onRevoke: (asset: VoiceAsset) => Promise<{ asset: VoiceAsset; receipt: SovereigntyRevocationReceipt }>
}) {
  const { state: appState } = useAppStore()
  const { userAssets } = useUserAssets()
  const { getPermissions, togglePermission, recallAsset, enableExternalUsage, isRecalled } = useAssetAuthorization()
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [showRecallModal, setShowRecallModal] = useState(false)
  const [showEnableModal, setShowEnableModal] = useState(false)
  const [recalling, setRecalling] = useState(false)

  const selectedAsset = userAssets.find((asset) => asset.id === selectedAssetId) ?? userAssets[0]
  const permissions = getPermissions(selectedAsset?.id ?? '')
  const currentAssetRate = useMemo(() => calculateCurrentAssetRate(permissions), [permissions])
  const activePermissionCount = Object.values(permissions).filter(Boolean).length
  const multiplier = currentAssetRate / maximumAssetAuthorizationValue
  const recalled = selectedAsset ? isRecalled(selectedAsset.id) : false
  const selectedVoiceAsset = data.assets.find((asset) => asset.id === selectedAsset?.sourceAssetId || asset.serial === selectedAsset?.id)

  useEffect(() => {
    if (!selectedAssetId && userAssets[0]) setSelectedAssetId(userAssets[0].id)
  }, [selectedAssetId, userAssets])

  const ledger = useMemo(() => {
    const assetIds = userAssets.map((asset) => asset.id)
    return [
      { id: 'ledger-1', title: 'AI 项目使用了《江心屿的夏夜记忆》', assetId: assetIds[0] || 'REC-WZ-0009', amount: 2, date: '06-30 18:42' },
      { id: 'ledger-2', title: '方言保护计划带来的回馈', assetId: assetIds[1] || 'REC-WZ-0007', amount: .1, date: '06-28 09:16' },
      { id: 'ledger-3', title: '高校研究使用带来的回馈', assetId: assetIds[2] || 'REC-WZ-0004', amount: .5, date: '06-27 21:08' },
    ]
  }, [userAssets])

  async function confirmMasterRecall() {
    if (!selectedAsset) return
    setRecalling(true)
    if (import.meta.env.DEV) {
      console.info('[OuVoice Contract] POST /smart-contract/sovereignty/recall', {
        assetId: selectedAsset.id,
        action: 'DISCONNECT_ALL_EXTERNAL_MODELS',
        nextPermissions: { privateStorage: true, culturalHeritage: false, academicUse: false, commercialTraining: false },
        requestedAt: new Date().toISOString(),
      })
    }
    try {
      const request = selectedVoiceAsset ? onRevoke(selectedVoiceAsset) : Promise.resolve(null)
      await Promise.all([request, new Promise((resolve) => window.setTimeout(resolve, 1400))])
      recallAsset(selectedAsset.id)
      setShowRecallModal(false)
      onToast('已停止所有外部使用，这段声音现在只由你保管')
    } finally {
      setRecalling(false)
    }
  }

  function confirmEnableExternalUsage() {
    if (!selectedAsset) return
    setShowEnableModal(false)
    enableExternalUsage(selectedAsset.id)
    if (import.meta.env.DEV) {
      console.info('[OuVoice Contract] ENABLE_EXTERNAL_USAGE', {
        assetId: selectedAsset.id,
        nextPermissions: { privateStorage: true, culturalHeritage: true, academicUse: true, commercialTraining: true },
        requestedAt: new Date().toISOString(),
      })
    }
    onToast('外部使用已重新开启，四项使用方式均已恢复')
  }

  return (
    <div className="screen revenue-screen-scroll w-full h-full overflow-y-auto !pb-32 flex flex-col space-y-6 bg-[radial-gradient(circle_at_100%_180px,rgba(245,166,35,.07),transparent_280px)]" data-testid="revenue-scroll-container">
      <header className="flex items-center">
        <div><span className="font-mono text-micro tracking-[.08em] text-content-muted">每一次使用，都有清楚记录</span><h1 className="mt-1 font-display text-2xl text-content-primary">我的声音收益</h1></div>
      </header>

      <section className="overflow-hidden rounded-panel border border-gold-glow bg-panel-radial bg-surface/95 p-4 shadow-panel">
        <div className="flex items-center justify-between font-mono text-micro text-content-muted"><span className="flex items-center gap-1.5"><CircleDollarSign size={15} className="text-gold-800" />目前累计回馈</span><span className="flex items-center gap-1 text-success"><i className="h-1.5 w-1.5 rounded-full bg-success" />已经到账</span></div>
        <strong className="mt-3 block font-display text-4xl font-normal tracking-wide text-content-primary"><i className="mr-1 text-base not-italic text-gold">¥</i>{formatMoney(appState.totalEarnings)}</strong>
        <div className="mt-2 flex items-center text-label text-success"><TrendingUp size={13} className="mr-1" />本月收益 +18.6%<span className="ml-auto text-content-muted">历史累计 ¥{formatMoney(data.totalRevenue)}</span></div>
        <div className="mt-4 flex items-center justify-between rounded-cyber border border-gold/15 bg-gold/5 px-3 py-2">
          <span className="font-mono text-micro text-content-muted">当前开放的使用方式</span>
          <strong className="font-mono text-sm text-gold-800">{activePermissionCount} 项 <small className="text-micro text-content-muted">· 回馈系数 {multiplier.toFixed(2)}</small></strong>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between"><div><span className="font-mono text-micro tracking-[.08em] text-content-muted">钱从哪里来，一目了然</span><h2 className="mt-1 font-display text-lg text-content-primary">最近的回馈</h2></div><span className="flex items-center gap-1 font-mono text-micro text-success"><i className="h-1 w-1 rounded-full bg-success" />已到账</span></div>
        <div className="overflow-hidden rounded-cyber border border-subtle bg-surface/80">
          {ledger.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2.5 border-b border-white/5 px-3 py-3 last:border-0">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-teal/10 text-teal"><Coins size={16} /></span>
              <span className="min-w-0 flex-1"><strong className="block truncate text-[9px] font-semibold text-content-secondary">{entry.title}</strong><small className="mt-1 block font-mono text-micro text-content-disabled">{entry.assetId} · {entry.date}</small></span>
              <b className="font-mono text-[9px] font-semibold text-gold-300">+¥{entry.amount.toFixed(2)}</b>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between"><div><span className="font-mono text-micro tracking-[.08em] text-content-muted">你随时可以改变主意</span><h2 className="mt-1 font-display text-lg text-content-primary">这段声音可以怎么用</h2></div><span className="flex items-center gap-1 rounded-full border border-teal/20 bg-teal/10 px-2 py-1 font-mono text-micro text-teal-700"><LockKeyhole size={10} />由你决定</span></div>

        <div className="relative isolate overflow-hidden rounded-2xl border border-subtle bg-surface/80 transform-gpu [clip-path:inset(0_round_1rem)]" data-testid="licensing-settings-panel">
          <label className="relative flex items-center gap-2 overflow-hidden rounded-t-2xl border-b border-subtle bg-surface-raised px-3 py-3">
            <DatabaseZap size={16} className="text-gold" />
            <select value={selectedAsset?.id || ''} onChange={(event) => setSelectedAssetId(event.target.value)} className="min-w-0 flex-1 appearance-none bg-transparent text-[10px] text-content-secondary outline-none">
              {userAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.id} · {asset.dialect}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none text-content-muted" />
          </label>
          <div className="flex items-center justify-between border-b border-subtle bg-teal/[.04] px-3 py-2 font-mono text-micro"><span className="text-content-muted">正在设置 · {selectedAsset?.id || '暂无声音'}</span><i className={`rounded-full px-2 py-1 not-italic ${recalled ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{recalled ? '仅自己保存' : `已开放 ${activePermissionCount} 项`}</i></div>

          <div className="overflow-hidden rounded-b-2xl bg-surface/80">
            {controls.map((control) => {
              const Icon = control.icon
              const checked = permissions[control.id]
              const disabled = recalled && control.id !== 'privateStorage'
              return (
                <label key={control.id} className={`flex min-h-[68px] items-center gap-2.5 border-b border-white/5 px-3 py-2.5 last:border-0 ${control.id === 'commercialTraining' ? 'overflow-hidden rounded-b-2xl bg-gold/[.018]' : ''}`}>
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-teal/[.06] text-teal-300"><Icon size={16} /></span>
                  <span className="min-w-0 flex-1"><strong className="flex items-center gap-1.5 text-[9px] text-content-secondary">{control.label}<i className="rounded border border-gold/15 px-1 py-0.5 font-mono text-micro font-normal not-italic text-gold-300">{control.rate ? `+¥${control.rate.toFixed(2)}/条` : '¥0.00/条'}</i></strong><small className="mt-1 block truncate text-micro text-content-muted">{control.english} · {control.note}</small></span>
                  <input type="checkbox" checked={checked} disabled={disabled} onChange={() => selectedAsset && togglePermission(selectedAsset.id, control.id)} className="peer sr-only" />
                  <span className="relative h-6 w-11 flex-none rounded-full border border-white/10 bg-black/30 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-content-muted after:transition-transform peer-checked:border-teal/40 peer-checked:bg-teal/15 peer-checked:after:translate-x-5 peer-checked:after:bg-teal peer-checked:after:shadow-glow-teal peer-disabled:opacity-35" />
                </label>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 rounded-panel border border-gold-glow bg-[#18130df2] p-4 shadow-[0_-12px_35px_rgba(0,0,0,.42)] backdrop-blur-xl">
        <div className="flex items-center justify-between"><span className="text-[9px] font-semibold text-content-secondary">预计每次使用的回馈</span><span className="font-mono text-micro text-success">按实际使用结算</span></div>
        <div className="mt-2 flex items-end justify-between"><strong className="font-mono text-3xl font-normal text-gold-800"><i className="mr-1 text-xs not-italic">¥</i>{currentAssetRate.toFixed(2)}<small className="ml-1 text-label text-content-muted">/ 条</small></strong><span className="font-mono text-micro text-content-muted">当前系数 {multiplier.toFixed(2)}</span></div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5"><i className="block h-full rounded-full bg-gradient-to-r from-gold-800 via-gold to-gold-300 shadow-glow-gold transition-[width] duration-300" style={{ width: `${multiplier * 100}%` }} /></div>
      </section>

      <section className="rounded-cyber border border-danger/25 bg-danger/[.045] p-3">
        <span className="flex items-center gap-1.5 font-mono text-micro tracking-[.08em] text-danger"><AlertOctagon size={15} />停止外部使用</span>
        <p className="mt-2 text-label text-content-muted">如果你不想再让任何机构使用这段声音，可以在这里全部关闭。</p>
        <button
          disabled={!selectedAsset}
          onClick={() => recalled ? setShowEnableModal(true) : setShowRecallModal(true)}
          className={`mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-cyber border text-[9px] font-bold transition-colors disabled:border-subtle disabled:bg-none disabled:text-content-disabled ${recalled ? 'border-success/35 bg-success/10 text-success' : 'border-danger/35 bg-danger/10 text-danger'}`}
        >
          {recalled ? <UserCheck size={18} /> : <UserRoundX size={18} />}
          {recalled ? '已停止外部使用' : '停止所有外部使用'}
        </button>
      </section>

      {showRecallModal && selectedAsset && createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" data-testid="recall-modal-backdrop">
          <section role="alertdialog" aria-modal="true" aria-labelledby="recall-title" className="relative max-h-[90vh] w-[90%] max-w-md overflow-y-auto rounded-panel border border-danger/40 bg-[radial-gradient(circle_at_50%_0,rgba(227,92,73,.12),transparent_40%),#15110d] p-5 text-center shadow-[0_28px_80px_rgba(0,0,0,.75)]" data-testid="recall-modal-card">
            <button disabled={recalling} onClick={() => setShowRecallModal(false)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-subtle text-content-muted" aria-label="关闭"><X size={17} /></button>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-danger/30 bg-danger/10 text-danger shadow-glow-danger"><AlertOctagon size={30} /></div>
            <span className="mt-4 block font-mono text-micro tracking-[.08em] text-danger/70">请再确认一次</span>
            <h2 id="recall-title" className="mt-2 text-lg font-semibold text-content-primary">停止所有外部使用？</h2>
            <div className="mt-4 space-y-2 text-left">
              {[
                '外部大模型与训练AI将再无法使用和检索您的声音。',
                '所有的科研合作、学术研究调用通道都将被关闭。',
                '您的声音资产产生的全网分红项目会即刻清零。',
              ].map((warning) => <p key={warning} className="flex gap-2 rounded-lg border border-danger/10 bg-danger/[.035] p-2.5 text-label leading-5 text-[#bba39d]"><AlertOctagon size={14} className="mt-0.5 flex-none text-danger/70" />{warning}</p>)}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-subtle bg-surface-raised px-3 py-2 font-mono text-micro"><span className="text-content-muted">这段声音</span><strong className="text-danger/80">{selectedAsset.id}</strong></div>
            <button disabled={recalling} onClick={() => void confirmMasterRecall()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-cyber border border-danger/35 bg-danger text-[9px] font-bold text-white disabled:opacity-75">{recalling ? <><LoaderCircle size={18} className="animate-spin" />正在关闭...</> : <><UserRoundX size={18} />确认停止使用</>}</button>
            <button disabled={recalling} onClick={() => setShowRecallModal(false)} className="mt-1 min-h-10 w-full text-label text-content-muted">取消并保留授权</button>
          </section>
        </div>,
        document.body,
      )}

      {showEnableModal && selectedAsset && createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" data-testid="enable-modal-backdrop">
          <section role="alertdialog" aria-modal="true" aria-labelledby="enable-title" className="relative max-h-[90vh] w-[90%] max-w-md overflow-y-auto rounded-panel border border-success/35 bg-[radial-gradient(circle_at_50%_0,rgba(73,184,137,.14),transparent_42%),#15110d] p-5 text-center shadow-[0_28px_80px_rgba(0,0,0,.75)]" data-testid="enable-modal-card">
            <button onClick={() => setShowEnableModal(false)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-subtle text-content-muted" aria-label="关闭"><X size={17} /></button>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-success/30 bg-success/10 text-success shadow-[0_0_28px_rgba(73,184,137,.16)]"><UserCheck size={30} /></div>
            <span className="mt-4 block font-mono text-micro tracking-[.08em] text-success/75">恢复使用前，请确认</span>
            <h2 id="enable-title" className="mt-2 text-lg font-semibold text-content-primary">重新开启外部使用？</h2>
            <div className="mt-4 space-y-2 text-left">
              <p className="rounded-lg border border-success/10 bg-success/[.035] p-2.5 text-label leading-5 text-content-secondary">⚠️ 开启后，外部大模型与科研合作通道将恢复对您声音资产的合法检索与调用。</p>
              <p className="rounded-lg border border-gold/10 bg-gold/[.035] p-2.5 text-label leading-5 text-content-secondary">📈 您的声音红利分红计价模型将重新激活，并在产生调用时实时入账。</p>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-subtle bg-surface-raised px-3 py-2 font-mono text-micro"><span className="text-content-muted">这段声音</span><strong className="text-success">{selectedAsset.id}</strong></div>
            <button onClick={confirmEnableExternalUsage} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-cyber border border-success/40 bg-success text-[9px] font-bold text-[#10140f] shadow-[0_8px_26px_rgba(73,184,137,.18)]"><UserCheck size={18} />确认开启授权</button>
            <button onClick={() => setShowEnableModal(false)} className="mt-1 min-h-10 w-full text-label text-content-muted">取消并保持隔离</button>
          </section>
        </div>,
        document.body,
      )}
    </div>
  )
}
