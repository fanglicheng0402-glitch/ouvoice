import { BadgeCheck, Building2, Check, Copy, FileKey2, Fingerprint, Link2, LockKeyhole, X } from 'lucide-react'
import { formatDuration, formatMoney, statusLabel } from '../lib/format'
import type { VoiceAsset } from '../types'
import { Waveform } from './Waveform'

export function AssetDetailSheet({
  asset,
  accepting,
  onClose,
  onAccept,
  onCopy,
}: {
  asset: VoiceAsset
  accepting: boolean
  onClose: () => void
  onAccept: (asset: VoiceAsset) => void
  onCopy: (value: string) => void
}) {
  return (
    <div className="sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="sheet asset-sheet" role="dialog" aria-modal="true" aria-label="声音资产详情">
        <div className="sheet-grabber" />
        <button className="sheet-close" onClick={onClose} aria-label="关闭"><X size={19} /></button>
        <div className="asset-certificate">
          <div className="certificate-orbit"><div className="asset-vinyl asset-vinyl--large"><span /></div></div>
          <span className={`status status--${asset.status.toLowerCase()}`}><BadgeCheck size={13} />{statusLabel[asset.status]}</span>
          <h2>{asset.title}</h2>
          <p>{asset.dialect} · {formatDuration(asset.duration)}</p>
          <Waveform bars={asset.waveform} active />
        </div>

        <div className="certificate-title">
          <span>数字原声资产凭证</span>
          <strong>{asset.serial}</strong>
        </div>
        <div className="certificate-grid">
          <div><Fingerprint size={17} /><span>声纹指纹<small>{asset.fingerprint}</small></span></div>
          <button onClick={() => onCopy(asset.txHash)}><Link2 size={17} /><span>保存记录<small>{asset.txHash}</small></span><Copy size={13} /></button>
          <div><LockKeyhole size={17} /><span>权利人<small>{asset.owner}</small></span></div>
          <div><FileKey2 size={17} /><span>授权次数<small>{asset.licenses} 次</small></span></div>
        </div>

        {asset.offer && asset.offer.status === 'PENDING' && (
          <div className="license-offer">
            <div className="license-offer__title">
              <span><Building2 size={16} />新授权邀约</span>
              <i>待确认</i>
            </div>
            <h3>{asset.offer.company}</h3>
            <p>{asset.offer.purpose}</p>
            <div className="license-offer__terms">
              <span>授权周期<strong>{asset.offer.duration}</strong></span>
              <span>预计收益<strong>¥ {formatMoney(asset.offer.amount)}</strong></span>
            </div>
            <button className="primary-button" disabled={accepting} onClick={() => onAccept(asset)}>
              {accepting ? '正在保存你的选择…' : <><Check size={18} />同意这次使用</>}
            </button>
          </div>
        )}

        <p className="legal-note">资产摘要已写入 OuVoice Chain。原始音频加密存储，未经你的明确授权不会向第三方开放。</p>
      </section>
    </div>
  )
}
