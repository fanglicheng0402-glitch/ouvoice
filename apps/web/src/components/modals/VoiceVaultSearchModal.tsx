import { Clock3, MapPin, Search, ShieldCheck, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { UserAsset } from '../../contexts'
import { filterVoiceAssets } from '../../lib/filterVoiceAssets'
import { formatDuration } from '../../lib/format'

export function VoiceVaultSearchModal({ open, assets, onClose, onSelect }: {
  open: boolean
  assets: UserAsset[]
  onClose: () => void
  onSelect: (asset: UserAsset) => void
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const results = useMemo(() => filterVoiceAssets(assets, query), [assets, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[125] flex items-center justify-center bg-[#3d342d]/45 p-4 backdrop-blur-sm"
      role="presentation"
      data-testid="vault-search-backdrop"
      onPointerDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section
        className="flex max-h-[78dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-[#fbf8f3] shadow-[0_28px_80px_rgba(74,58,43,.28)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="vault-search-modal"
      >
        <header className="flex items-center justify-between border-b border-[#e8e0d8] px-5 py-4">
          <div>
            <span className="font-mono text-micro tracking-[.08em] text-[#8b8177]">VOICE VAULT SEARCH</span>
            <h2 id={titleId} className="mt-1 font-display text-xl text-content-primary">搜索我的声库</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white text-content-secondary shadow-sm" aria-label="关闭声库搜索"><X size={19} /></button>
        </header>

        <div className="px-5 pt-4">
          <label className="flex h-12 items-center gap-3 rounded-2xl border border-teal/35 bg-white px-4 shadow-[0_0_0_3px_rgba(146,124,223,.08)]">
            <Search size={19} className="flex-none text-teal-700" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-content-primary outline-none placeholder:text-content-disabled"
              placeholder="输入编号、地区或内容关键词"
              aria-label="搜索关键词"
            />
            {query && <button type="button" onClick={() => setQuery('')} className="rounded-full bg-surface-raised px-2.5 py-1 text-micro text-content-muted">清空</button>}
          </label>
          <p className="flex items-center justify-between px-1 py-3 text-label text-content-muted">
            <span>{query ? `找到 ${results.length} 条相关乡音` : '可以搜索编号、方言、地区、标题或状态'}</span>
            <strong className="font-mono font-medium text-teal-700">{results.length}/{assets.length}</strong>
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-5 pb-5" data-testid="vault-search-results">
          {results.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => { onSelect(asset); onClose() }}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#ebe4dc] bg-white p-3.5 text-left shadow-[0_6px_18px_rgba(74,58,43,.05)] transition active:scale-[.99]"
              data-testid={`vault-search-result-${asset.id}`}
            >
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-[#eee6ff] text-teal-700"><ShieldCheck size={19} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><strong className="font-mono text-xs text-teal-700">{asset.id}</strong><i className="truncate text-label not-italic text-content-muted"><MapPin size={11} className="mr-1 inline" />{asset.dialect}</i></span>
                <strong className="mt-1 block truncate text-sm font-semibold text-content-primary">{asset.title || `${asset.dialect}方言原声`}</strong>
                <small className="mt-1 flex items-center gap-1 text-content-muted"><Clock3 size={11} />{formatDuration(asset.duration)} · {asset.status}</small>
              </span>
            </button>
          ))}

          {!results.length && (
            <div className="grid justify-items-center rounded-2xl bg-white/70 px-5 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#eee6ff] text-teal-700"><Search size={24} /></span>
              <h3 className="mt-4 text-sm font-semibold text-content-primary">没有找到相关乡音</h3>
              <p className="mt-1 text-label text-content-muted">试试更短的编号、地区或内容关键词</p>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}
