import { AudioLines, ChevronLeft, ChevronRight, CircleDollarSign, MapPinned, ShieldCheck, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

const guideSteps = [
  {
    icon: AudioLines,
    eyebrow: '第一步 · 录音',
    title: '跟着提示，说一段温州话',
    description: '轻点圆形录音按钮，第一次使用时允许麦克风权限。自然说满 5 秒，再点“完成录音”。',
    note: '不用刻意标准，保留你平常说话的语气就好。',
  },
  {
    icon: ShieldCheck,
    eyebrow: '第二步 · 声库',
    title: '录好的乡音，会收进声库',
    description: '完成保存后，可以在“声库”里播放、查看状态，或删除不想保留的录音。',
    note: '每一条录音都有自己的 REC 编号，方便你随时找到。',
  },
  {
    icon: MapPinned,
    eyebrow: '第三步 · 社区',
    title: '挑一个感兴趣的乡音任务',
    description: '在“社区”查看温州各地的记录任务。选择任务后，会自动回到录音页并准备好朗读内容。',
    note: '鹿城、瓯海、龙湾、瑞安等地的说法都值得留下。',
  },
  {
    icon: CircleDollarSign,
    eyebrow: '第四步 · 使用与回报',
    title: '声音怎么用，由你来决定',
    description: '在“资产”页查看这段声音去了哪里、带来了多少回报，也可以随时停止外部使用。',
    note: '停止使用前会再次向你确认，避免误操作。',
  },
] as const

export function AppOnboardingModal({ open, onClose, onComplete }: {
  open: boolean
  onClose: () => void
  onComplete: () => void
}) {
  const [step, setStep] = useState(0)
  const titleId = useId()
  const current = guideSteps[step]
  const isLastStep = step === guideSteps.length - 1

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open])

  if (!open) return null

  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#4a3a2f]/35 p-4 backdrop-blur-sm" data-testid="app-onboarding-backdrop">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92vh] w-full max-w-[390px] flex-col overflow-hidden rounded-[30px] border border-[#eadbc9] bg-[#fffaf0] shadow-[0_28px_80px_rgba(74,58,43,.24)]"
        data-testid="app-onboarding-modal"
      >
        <button type="button" onClick={onClose} aria-label="关闭新手引导" className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-[#eadfd3] bg-white/90 text-[#746b63] shadow-sm"><X size={18} /></button>

        <div className="overflow-y-auto px-6 pb-6 pt-5">
          <div className="relative mx-auto h-[142px] w-full overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_50%_40%,#fff1c9_0,#f8e8d2_48%,#efe4ff_100%)]">
            <i className="absolute left-5 top-5 h-12 w-12 rounded-full border border-white/60" />
            <i className="absolute bottom-5 right-6 h-8 w-8 rounded-full bg-white/45" />
            <img src="/brand/ouvoice-mascot-warm.png" alt="山茶花录音小助手" className="absolute bottom-[-22px] left-1/2 w-[136px] -translate-x-1/2 drop-shadow-[0_12px_16px_rgba(139,79,38,.15)]" />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="rounded-full bg-[#fff0c5] px-3 py-1.5 text-[10px] font-semibold text-[#815318]">首次使用指南</span>
            <span className="text-[10px] text-[#91887f]">{step + 1} / {guideSteps.length}</span>
          </div>

          <div className="mt-4 flex gap-2" aria-label="引导进度">
            {guideSteps.map((item, index) => (
              <button
                key={item.eyebrow}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`查看${item.eyebrow}`}
                aria-current={index === step ? 'step' : undefined}
                className={`h-1.5 flex-1 rounded-full transition-colors ${index <= step ? 'bg-[#c96a3d]' : 'bg-[#eadfd3]'}`}
              />
            ))}
          </div>

          <div className="mt-6 flex items-start gap-4">
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#f6e7d2] text-[#b9553b]"><Icon size={23} /></span>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold tracking-[.08em] text-[#a05b38]">{current.eyebrow}</span>
              <h2 id={titleId} className="mt-2 font-display text-[22px] leading-8 text-[#2e2925]">{current.title}</h2>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-7 text-[#5f5750]">{current.description}</p>
          <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-[11px] leading-5 text-[#7b7067] shadow-[0_6px_18px_rgba(74,58,43,.05)]">{current.note}</p>

          <div className="mt-6 flex items-center gap-3">
            {step > 0 && (
              <button type="button" onClick={() => setStep((value) => value - 1)} className="flex min-h-12 flex-1 items-center justify-center gap-1 rounded-2xl border border-[#eadfd3] bg-white text-[12px] font-semibold text-[#6f665f]"><ChevronLeft size={17} />上一步</button>
            )}
            <button
              type="button"
              onClick={() => isLastStep ? onComplete() : setStep((value) => value + 1)}
              data-testid="onboarding-next"
              className="flex min-h-12 flex-[1.45] items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-[#d88a48] to-[#c96a3d] px-4 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(185,85,59,.20)]"
            >
              {isLastStep ? '知道了，开始录音' : '下一步'}{!isLastStep && <ChevronRight size={17} />}
            </button>
          </div>

          {!isLastStep && <button type="button" onClick={onClose} className="mt-4 min-h-10 w-full text-[11px] text-[#8d847c]">跳过引导</button>}
        </div>
      </section>
    </div>
  )
}
