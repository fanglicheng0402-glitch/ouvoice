import { Blocks, Check, CheckCircle2, ChevronRight, Copy, Crown, DatabaseZap, FlaskConical, Globe2, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { BlockchainLedgerReceipt, MintLicenseTier, VoiceAsset } from '../types'

const tiers: { id: MintLicenseTier; title: string; english: string; description: string; price: string; badge: string; icon: typeof Crown }[] = [
  { id: 'ECOSYSTEM_CORE', title: '支持方言共创计划', english: '长期共创', description: '用于方言保护与社区共创，使用回馈会持续记录', price: '持续回馈', badge: '推荐', icon: Crown },
  { id: 'GLOBAL_TRAINING', title: '允许通用 AI 训练', english: '商业使用', description: '只向通过审核的项目开放，不包含声音克隆', price: '¥2.00', badge: '回馈较高', icon: Globe2 },
  { id: 'RESEARCH_ONLY', title: '只用于高校和科研', english: '学术使用', description: '仅限学校、研究机构和方言保护项目使用', price: '¥0.50', badge: '安心开放', icon: FlaskConical },
  { id: 'NO_AI_USAGE', title: '暂时只自己保存', english: '不对外使用', description: '先收进自己的声库，以后随时可以再决定', price: '免费', badge: '最私密', icon: LockKeyhole },
]

export function VoiceMintingModal({ asset, onConfirm, onComplete }: {
  asset: VoiceAsset
  onConfirm: (asset: VoiceAsset, tier: MintLicenseTier) => Promise<{ asset: VoiceAsset; receipt: BlockchainLedgerReceipt }>
  onComplete: (asset: VoiceAsset) => void
}) {
  const [tier, setTier] = useState<MintLicenseTier>('ECOSYSTEM_CORE')
  const [processing, setProcessing] = useState(false)
  const [receipt, setReceipt] = useState<BlockchainLedgerReceipt | null>(null)
  const [mintedAsset, setMintedAsset] = useState(asset)
  const [copied, setCopied] = useState(false)

  async function confirm() {
    setProcessing(true)
    try {
      const result = await onConfirm(asset, tier)
      setMintedAsset(result.asset)
      setReceipt(result.receipt)
    } finally {
      setProcessing(false)
    }
  }

  async function copyHash() {
    if (!receipt) return
    try { await navigator.clipboard.writeText(receipt.txHash) } catch { /* clipboard may be unavailable in WebView */ }
    setCopied(true)
  }

  return (
    <div className="mint-backdrop">
      <section className="mint-modal" role="dialog" aria-modal="true" aria-labelledby="mint-title">
        <div className="flex max-h-[calc(100vh-160px)] flex-col overflow-y-auto overscroll-contain px-4 pb-16 touch-pan-y" data-testid="mint-scroll-shell">
          {!receipt ? (
            <>
            <div className="mint-celebration">
              <span className="mint-orbit mint-orbit--one" /><span className="mint-orbit mint-orbit--two" />
              <div><Sparkles size={28} /></div>
            </div>
            <span className="eyebrow">谢谢你留下这一段乡音</span>
            <h2 id="mint-title">录音完成啦！</h2>
            <p>接下来，请选择这段声音可以用在哪里。以后也能随时修改。</p>
            <div className="mint-serial"><span>声音卡片编号</span><strong>{asset.serial}</strong><i>已保留</i></div>

            <fieldset className="mint-tiers">
              <legend>选择使用方式</legend>
              {tiers.map(({ id, title, english, description, price, badge, icon: Icon }) => (
                <label key={id} className={tier === id ? 'is-selected' : ''}>
                  <input type="radio" name="mint-tier" value={id} checked={tier === id} onChange={() => setTier(id)} />
                  <span className="mint-radio">{tier === id && <Check size={11} />}</span>
                  <span className="mint-tier-icon"><Icon size={16} /></span>
                  <span className="mint-tier-copy"><strong>{title}<small>{english}</small></strong><p>{description}</p></span>
                  <span className="mint-tier-price"><i>{badge}</i><strong>{price}</strong></span>
                </label>
              ))}
            </fieldset>

            <div className="mint-security"><ShieldCheck size={15} /><span>这段声音始终归你管理，选择可以随时更改</span><strong>安心保存</strong></div>
            <button className="mint-confirm-button mb-12 flex-none" disabled={processing} onClick={confirm}>
              {processing ? <><LoaderCircle size={18} className="spin" />正在保存声音卡片…</> : <><Blocks size={18} />确认并保存到我的声库<ChevronRight size={17} /></>}
            </button>
            </>
          ) : (
            <div className="ledger-receipt">
              <div className="receipt-confirmed"><span><CheckCircle2 size={30} /></span></div>
              <span className="eyebrow">已经稳稳地收好了</span>
              <h2>声音卡片保存成功</h2>
              <p>{mintedAsset.serial} 已经放进你的声库，如何使用仍由你决定。</p>
              <div className="receipt-paper">
                <div className="receipt-paper__head"><span><DatabaseZap size={15} />保存记录</span><i>已完成</i></div>
                <dl>
                  <div><dt>声音编号</dt><dd>{mintedAsset.serial}</dd></div>
                  <div><dt>记录编号</dt><dd>{receipt.ledgerId}</dd></div>
                  <div><dt>保存批次</dt><dd>#{receipt.blockNumber.toLocaleString()}</dd></div>
                  <div><dt>使用方式</dt><dd>{tiers.find((item) => item.id === receipt.licenseTier)?.badge}</dd></div>
                  <div className="receipt-hash"><dt>校验编号</dt><dd>{receipt.txHash.slice(0, 16)}…{receipt.txHash.slice(-8)}<button onClick={copyHash}>{copied ? <Check size={12} /> : <Copy size={12} />}</button></dd></div>
                  <div><dt>保存时间</dt><dd>{new Date(receipt.confirmedAt).toLocaleString('zh-CN', { hour12: false })}</dd></div>
                </dl>
                <div className="receipt-seal"><ShieldCheck size={15} />OuVoice · 已安全保存</div>
              </div>
              <button className="mint-confirm-button mb-12 flex-none" onClick={() => onComplete(mintedAsset)}><CheckCircle2 size={18} />完成并查看我的声库</button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
