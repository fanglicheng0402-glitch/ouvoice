import { Bug, Lightbulb, MessageCircle, Send, X } from 'lucide-react'
import { FormEvent, useId, useState } from 'react'

const feedbackTypes = [
  { id: 'problem', label: '遇到问题', icon: Bug },
  { id: 'suggestion', label: '功能建议', icon: Lightbulb },
] as const

const STORAGE_KEY = 'ouvoice:feedback:v1'

export function FeedbackModal({ open, onClose, onSubmitted }: {
  open: boolean
  onClose: () => void
  onSubmitted: () => void
}) {
  const titleId = useId()
  const [type, setType] = useState<(typeof feedbackTypes)[number]['id']>('problem')
  const [content, setContent] = useState('')

  if (!open) return null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = content.trim()
    if (!message) return

    try {
      const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as unknown[]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([
        ...existing,
        { id: crypto.randomUUID(), type, content: message, createdAt: new Date().toISOString() },
      ]))
    } catch {
      // 本地存储不可用时，仍允许用户完成原型中的反馈流程。
    }

    setContent('')
    setType('problem')
    onSubmitted()
  }

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-[#4a3a2f]/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-[360px] overflow-hidden rounded-[28px] border border-[#eadbc9] bg-[#fffaf0] shadow-[0_28px_80px_rgba(74,58,43,.24)]">
        <div className="flex items-start justify-between px-5 pb-3 pt-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f7e4ce] text-[#b9553b]"><MessageCircle size={21} /></span>
            <div>
              <span className="text-[10px] font-semibold tracking-[.08em] text-[#a05b38]">告诉录音小助手</span>
              <h2 id={titleId} className="mt-1 font-display text-[20px] text-[#2e2925]">问题反馈</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭反馈" className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#746b63] shadow-sm"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5">
          <p className="mb-4 text-[12px] leading-6 text-[#6e655e]">哪里不好用，或者你希望我们改进什么？写下来就好。</p>
          <div className="grid grid-cols-2 gap-2">
            {feedbackTypes.map((item) => {
              const Icon = item.icon
              const active = type === item.id
              return <button key={item.id} type="button" onClick={() => setType(item.id)} className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl border text-[11px] font-semibold transition-colors ${active ? 'border-[#d88a48] bg-[#fff0c5] text-[#80501c]' : 'border-[#eadfd3] bg-white text-[#756b63]'}`}><Icon size={16} />{item.label}</button>
            })}
          </div>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="请描述你遇到的问题…"
            maxLength={300}
            autoFocus
            className="mt-3 h-32 w-full resize-none rounded-2xl border border-[#eadfd3] bg-white p-4 text-[12px] leading-6 text-[#3f3934] outline-none placeholder:text-[#aaa198] focus:border-[#d88a48]"
          />
          <div className="mt-1 text-right text-[9px] text-[#9a9087]">{content.length} / 300</div>
          <button type="submit" disabled={!content.trim()} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d88a48] to-[#c96a3d] text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(185,85,59,.20)] disabled:cursor-not-allowed disabled:opacity-40"><Send size={16} />提交反馈</button>
        </form>
      </section>
    </div>
  )
}
