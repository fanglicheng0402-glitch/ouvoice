import { ScrollText, ShieldCheck, X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

const agreementSections = [
  {
    title: '【前言与核心主权声明】',
    paragraphs: [
      '欢迎您使用瓯语声原声资产采集平台。本平台致力于保护中国传统方言（温州话/瓯语）的生物数字资产。在您录制并提交音频前，请仔细阅读本协议。平台全盘尊重并保护您的“声音主权”。',
    ],
  },
  {
    title: '一、声音资产所有权（声音数字资产化）',
    paragraphs: [
      '1.1 您在平台录制并上传的每一段方言音频，其原始人声版权、声纹特征及衍生数字资产所有权，均100%属于您个人。',
      '1.2 平台在您录制成功后，将自动通过分布式区块链技术对您的音频进行“数字特征指纹（SHA-256）”加密存证，生成唯一的数字资产制卡凭证，任何第三方未经授权不得搬运或据为己有。',
    ],
  },
  {
    title: '二、分级商业授权与动态分红机制',
    paragraphs: [
      '2.1 平台提供四级梯队式的隐私与AI调用授权。您可以随时在“资产”页面勾选或取消不同的调用范围（包括：文化公益、学术科研、商业大模型训练）。',
      '2.2 只要您开启了商业大模型训练或科研授权，当下游AI大模型（如方言TTS、语音生成模型）调用或检索您的声纹资产时，系统将严格按照您组合的实时计价单价（最高可达 ¥0.51/秒）向您的个人账户结算分红。',
    ],
  },
  {
    title: '三、绝对主权翻转与“一键撤回”权利',
    paragraphs: [
      '3.1 平台赋予您不可剥夺的“一键主权撤回”权利。当您在资产页面点击该功能并确认后，平台将立即更改区块链授权状态，并向全网商业模型下达断开指令。',
      '3.2 撤回指令生效后，所有外部大模型及训练机构将永久失去对您该段音频的检索、调用与训练资格，您的数据将在商业流中被即刻隔离清除。',
    ],
  },
  {
    title: '四、生物特征信息保护',
    paragraphs: [
      '4.1 平台严格遵守生物识别数据保护法律，您的原始声音波形与声纹Embedding向量在未获得您的明确许可前，绝不向任何公共网络进行明文披露或售卖。',
    ],
  },
]

export function UserAgreementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onPointerDown={(event) => { if (event.target === event.currentTarget) onClose() }}
      data-testid="agreement-backdrop"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[24px] border border-[#f5a623]/35 bg-[radial-gradient(circle_at_50%_0,rgba(245,166,35,.12),transparent_32%),#17110b] shadow-[0_28px_90px_rgba(0,0,0,.78),inset_0_1px_rgba(255,232,190,.05)]"
        data-testid="agreement-modal"
      >
        <div className="flex flex-none items-start gap-3 border-b border-[#f5a623]/15 px-5 pb-4 pt-5">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-[#f5a623]/25 bg-[#f5a623]/10 text-[#f5a623]"><ScrollText size={21} /></span>
          <div className="min-w-0 flex-1 pr-8">
            <span className="font-mono text-[8px] tracking-[.12em] text-[#b88b47]">OUVOICE USER AGREEMENT</span>
            <h2 id={titleId} className="mt-1 !font-sans !text-base !font-semibold !leading-6 !text-[#fff3d9]">《“瓯语声 (OuVoice)”原声资产保护与AI大模型授权用户协议》</h2>
            <p className="mt-1 text-[9px] text-[#887b6b]">版本 1.0 · 更新日期：2026年7月1日</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭协议"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.025] text-[#a99c8c] transition-colors hover:border-[#f5a623]/30 hover:text-[#f5a623]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 max-h-[75vh] flex-1 overflow-y-auto px-5 py-4 pr-2" data-testid="agreement-scroll-container">
          <div className="space-y-5 pr-3">
            <div className="flex items-start gap-2 rounded-xl border border-[#f5a623]/18 bg-[#f5a623]/[.055] p-3 text-[10px] leading-5 text-[#c8b89f]">
              <ShieldCheck size={16} className="mt-0.5 flex-none text-[#d49a3f]" />
              <span>请在录制并提交音频前完整阅读。继续使用平台即表示您理解本协议所列的权利、授权范围与撤回方式。</span>
            </div>

            {agreementSections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h3 className="text-[12px] font-semibold leading-5 text-[#e8c98f]">{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="m-0 text-justify text-[10px] leading-[1.9] text-[#c4b7a7]">{paragraph}</p>
                ))}
              </section>
            ))}

            <div className="border-t border-[#f5a623]/12 pt-4 text-center font-mono text-[8px] tracking-[.08em] text-[#6f6559]">
              OUVOICE · VOICE SOVEREIGNTY PROTECTION
            </div>
          </div>
        </div>

        <div className="flex-none border-t border-[#f5a623]/15 bg-black/15 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#f5a623]/40 bg-gradient-to-r from-[#d98713] via-[#f5a623] to-[#ffca6a] text-[11px] font-bold text-[#261706] shadow-[0_10px_28px_rgba(245,166,35,.16)]"
          >
            <X size={16} />关闭协议
          </button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
