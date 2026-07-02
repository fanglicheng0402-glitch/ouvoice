export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup" aria-label="OuVoice 原声资产采集平台">
      <div className={`brand-mark ${compact ? 'brand-mark--compact' : ''}`}>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div>
        <div className="brand-word">OUVOICE</div>
        {!compact && <div className="brand-subtitle">原声资产采集平台</div>}
      </div>
    </div>
  )
}
