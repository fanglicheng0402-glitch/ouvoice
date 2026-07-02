import { Clock3, DatabaseZap, MapPin, Pause, Play, Search, ShieldCheck, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { VoiceVaultSearchModal } from '../components/modals'
import { useAudioPlayback, useUserAssets, type UserAsset } from '../contexts'
import { formatDuration } from '../lib/format'

type VaultFilter = 'ALL' | 'PENDING' | 'RIGHTS'

const filters: { label: string; value: VaultFilter }[] = [
  { label: '全部', value: 'ALL' },
  { label: '待授权', value: 'PENDING' },
  { label: '已入库', value: 'RIGHTS' },
]

function displayDuration(seconds: number) {
  return seconds < 60 ? `${seconds}s` : formatDuration(seconds)
}

export function AssetsScreen({ onInspect, onDelete }: {
  onInspect?: (asset: UserAsset) => void
  onDelete: (asset: UserAsset) => Promise<void>
}) {
  const { userAssets, removeAsset } = useUserAssets()
  const player = useAudioPlayback()
  const [filter, setFilter] = useState<VaultFilter>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = useCallback(() => setIsSearchOpen(true), [])
  const closeSearch = useCallback(() => setIsSearchOpen(false), [])
  const selectSearchResult = useCallback((asset: UserAsset) => onInspect?.(asset), [onInspect])

  const filteredAssets = useMemo(() => userAssets.filter((asset) => {
    if (filter === 'PENDING') return asset.status.includes('待确认')
    if (filter === 'RIGHTS') return asset.status.includes('由我管理')
    return true
  }), [filter, userAssets])

  async function deleteAsset(asset: UserAsset) {
    if (player.playingId === asset.id) player.stop()
    setDeletingId(asset.id)
    try {
      await onDelete(asset)
      removeAsset(asset.id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="screen flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_100%_240px,rgba(0,180,216,.05),transparent_280px)]">
      <header className="mb-5 flex items-center justify-between">
        <div><span className="font-mono text-micro tracking-[.08em] text-content-muted">把家乡的声音好好收着</span><h1 className="mt-1 font-display text-2xl text-content-primary">我的声库</h1></div>
        <button type="button" onClick={openSearch} className="grid h-10 w-10 place-items-center rounded-full border border-subtle bg-white/[.02] text-content-secondary" aria-label="搜索声库"><Search size={18} /></button>
      </header>

      <section className="rounded-panel border border-teal-glow bg-panel-radial bg-surface/90 p-4 shadow-panel">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-content-secondary"><DatabaseZap size={17} className="text-teal" />已经收下的乡音</span>
          <strong className="font-display text-3xl font-normal text-content-primary">{userAssets.length}<small className="ml-1 font-sans text-label text-content-muted">份</small></strong>
        </div>
        <div className="mt-3 grid grid-cols-2 divide-x divide-white/5 border-t border-white/5 pt-3 font-mono text-micro">
          <span className="flex items-center gap-2 text-content-muted"><ShieldCheck size={14} className="text-gold" />待授权 <b className="ml-auto mr-3 text-content-secondary">{userAssets.filter((asset) => asset.status.includes('待确认')).length}</b></span>
          <span className="flex items-center gap-2 pl-3 text-content-muted"><ShieldCheck size={14} className="text-success" />已入库 <b className="ml-auto text-content-secondary">{userAssets.filter((asset) => asset.status.includes('由我管理')).length}</b></span>
        </div>
      </section>

      <div className="my-4 flex gap-2" role="tablist">
        {filters.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} className={`rounded-full border px-3 py-2 text-label transition-colors ${filter === item.value ? 'border-teal/35 bg-teal/10 text-teal-300' : 'border-subtle bg-white/[.015] text-content-muted'}`}>{item.label}</button>)}
      </div>

      <div className="flex min-h-0 max-h-[calc(100vh-200px)] flex-1 touch-pan-y flex-col space-y-3 overflow-y-auto overscroll-contain px-4 pt-4 pb-24" data-testid="vault-asset-list">
        {filteredAssets.map((asset) => {
          const isPlaying = player.playingId === asset.id
          const remainingSeconds = Math.max(0, Math.ceil(asset.duration * (1 - (isPlaying ? player.progress : 0))))
          return (
            <article
              key={asset.id}
              className={`relative flex flex-none items-center justify-between gap-3 overflow-hidden rounded-xl border bg-surface/95 p-4 shadow-panel transition-all ${isPlaying ? 'border-teal/40 shadow-glow-teal' : 'border-subtle'}`}
              data-testid={`vault-asset-card-${asset.id}`}
            >
              {isPlaying && <i className="absolute inset-y-0 left-0 w-0.5 bg-teal shadow-glow-teal" />}

              <button type="button" onClick={() => onInspect?.(asset)} className="min-w-0 flex-1 text-left">
                <span className="flex flex-col space-y-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <strong className="rounded border border-teal/25 bg-teal/10 px-2 py-1 font-mono text-label font-semibold tracking-[.06em] text-teal-300">{asset.id}</strong>
                    <i className="flex items-center gap-1 text-xs not-italic text-content-muted"><MapPin size={12} />{asset.dialect}</i>
                  </span>
                  <strong className="truncate text-sm font-semibold text-content-primary">{asset.title || `${asset.dialect}方言原声`}</strong>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Clock3 size={12} />时长/长度: {displayDuration(asset.duration)}</span>
                  <span className="flex flex-wrap items-center gap-2 pt-0.5">
                    <i className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-micro not-italic ${asset.status.includes('待确认') ? 'border-gold/30 bg-gold/10 text-gold-800' : 'border-success/25 bg-success/10 text-success'}`}><b className="h-1 w-1 rounded-full bg-current" />{asset.status}</i>
                    <small className="font-mono text-micro text-content-disabled">{new Date(asset.timestamp).toLocaleString('zh-CN', { hour12: false })}</small>
                  </span>
                  <span className="pt-1">
                    <i className="block h-1 overflow-hidden rounded-full bg-white/5"><b className="block h-full rounded-full bg-gradient-to-r from-teal-700 via-teal to-teal-300 shadow-glow-teal transition-[width] duration-100" style={{ width: `${isPlaying ? player.progress * 100 : 0}%` }} /></i>
                    <small className={`mt-1 block font-mono text-micro ${isPlaying ? 'text-teal-700' : 'text-content-disabled'}`}>{isPlaying ? `还剩 ${remainingSeconds} 秒` : '可以播放'}</small>
                  </span>
                </span>
              </button>

              <div className="flex flex-none items-center space-x-2">
                <button
                  type="button"
                  onClick={() => void player.toggle(asset).catch(() => undefined)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors ${isPlaying ? 'bg-teal/10 text-teal-300' : 'bg-gold/5 text-gold-300 hover:bg-gold/10'}`}
                >
                  {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                  <span>{isPlaying ? '暂停' : '播放'}</span>
                </button>
                <button
                  type="button"
                  disabled={deletingId === asset.id}
                  onClick={() => void deleteAsset(asset)}
                  className="flex items-center gap-1 rounded-lg bg-danger/5 px-3 py-1.5 text-sm text-danger/75 transition-colors hover:bg-danger/10 disabled:opacity-40"
                >
                  <Trash2 size={15} />
                  <span>{deletingId === asset.id ? '删除中' : '删除'}</span>
                </button>
              </div>
            </article>
          )
        })}

        {!filteredAssets.length && <div className="grid justify-items-center py-16 text-center text-content-muted"><DatabaseZap size={29} /><h3 className="mt-3 text-sm text-content-secondary">这里还没有乡音</h3><p className="mt-1 text-label">完成一次录音后，它会安静地收在这里</p></div>}
      </div>

      <VoiceVaultSearchModal
        open={isSearchOpen}
        assets={userAssets}
        onClose={closeSearch}
        onSelect={selectSearchResult}
      />
    </div>
  )
}
