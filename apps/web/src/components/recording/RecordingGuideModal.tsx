import { AudioLines, CheckCircle2, Mic2, ShieldCheck, X } from 'lucide-react'
import { useEffect, useId } from 'react'

const guideSteps = [
  { icon: Mic2, title: '按任务文本自然朗读', note: '保持平常说话的语速，保留方言语气词与地方发音。' },
  { icon: AudioLines, title: '建议录制 5 秒及以上', note: '尽量选择安静环境，避免触碰麦克风或突然中断。' },
  { icon: ShieldCheck, title: '保存为一张声音卡片', note: '录音清楚后，可以选择它将来能用在哪里。' },
]

export function RecordingGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-black/80 p-5 backdrop-blur-md"
      onPointerDown={(event) => { if (event.target === event.currentTarget) onClose() }}
      data-testid="recording-guide-backdrop"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[390px] overflow-hidden rounded-panel border border-gold/30 bg-[radial-gradient(circle_at_50%_0,rgba(245,166,35,.13),transparent_40%),#15110d] p-5 shadow-[0_28px_80px_rgba(0,0,0,.78)]"
        data-testid="recording-guide-modal"
      >
        <button type="button" onClick={onClose} aria-label="关闭录音指南" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-subtle text-content-muted transition-colors hover:border-gold/30 hover:text-gold-300"><X size={16} /></button>

        <span className="font-mono text-micro tracking-[.08em] text-gold-800">第一次录音也很简单</span>
        <h2 id={titleId} className="mt-2 pr-10 font-display text-2xl font-normal text-content-primary">录音采集指南</h2>
        <p className="mt-2 text-[10px] leading-5 text-content-muted">跟着三步走，把熟悉的乡音清楚地留下来。</p>

        <div className="mt-5 space-y-2.5">
          {guideSteps.map(({ icon: Icon, title, note }, index) => (
            <div key={title} className="flex gap-3 rounded-cyber border border-white/[.06] bg-white/[.018] p-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-teal/20 bg-teal/[.06] text-teal-300"><Icon size={18} /></span>
              <span className="min-w-0 flex-1"><strong className="flex items-center gap-2 text-[10px] text-content-secondary"><i className="font-mono text-micro not-italic text-gold-300">0{index + 1}</i>{title}</strong><small className="mt-1 block text-[8px] leading-4 text-content-muted">{note}</small></span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-cyber border border-success/15 bg-success/[.045] px-3 py-2.5 text-[9px] text-success"><CheckCircle2 size={15} />建议佩戴耳机，录音时与设备保持约 20 厘米距离。</div>
        <button type="button" onClick={onClose} className="primary-button mt-5">知道了，继续录音</button>
      </section>
    </div>
  )
}
