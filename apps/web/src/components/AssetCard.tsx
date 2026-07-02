import { ChevronRight, Coins, ShieldCheck } from 'lucide-react'
import { formatDuration, statusLabel } from '../lib/format'
import type { VoiceAsset } from '../types'
import { Waveform } from './Waveform'

export function AssetCard({ asset, onSelect }: { asset: VoiceAsset; onSelect: (asset: VoiceAsset) => void }) {
  return (
    <button className="asset-card" onClick={() => onSelect(asset)}>
      <div className="asset-card__head">
        <span className={`status status--${asset.status.toLowerCase()}`}>
          {asset.status !== 'REVIEWING' && <ShieldCheck size={12} />}
          {statusLabel[asset.status]}
        </span>
        <span className="serial">{asset.serial}</span>
      </div>
      <div className="asset-card__body">
        <div className="asset-vinyl">
          <span />
        </div>
        <div className="asset-card__content">
          <h3>{asset.title}</h3>
          <p>{asset.dialect} · {formatDuration(asset.duration)}</p>
          <Waveform bars={asset.waveform} />
        </div>
      </div>
      <div className="asset-card__foot">
        <span>{asset.createdAt.replaceAll('-', '.')}</span>
        {asset.revenue > 0 ? <strong><Coins size={13} />累计 ¥{asset.revenue}</strong> : <span>质量评分 {asset.quality}</span>}
        <ChevronRight size={16} />
      </div>
    </button>
  )
}
