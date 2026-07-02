import { CheckCircle2, Clock3, Headphones, MapPin, Mic2, ShieldCheck, X } from 'lucide-react'
import type { VoiceTask } from '../types'

export function TaskDetailSheet({ task, onClose, onStart }: { task: VoiceTask; onClose: () => void; onStart: (task: VoiceTask) => void }) {
  return (
    <div className="sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="sheet task-sheet" role="dialog" aria-modal="true" aria-label="任务详情">
        <div className="sheet-grabber" />
        <button className="sheet-close" onClick={onClose} aria-label="关闭"><X size={19} /></button>
        <span className="micro-tag">{task.category}</span>
        <h2>{task.title}</h2>
        <div className="task-sheet__meta">
          <span><MapPin size={14} />{task.region}</span><span><Clock3 size={14} />{task.duration}</span><span>{task.difficulty}</span>
        </div>

        <div className="reward-panel">
          <span>完成并通过质检后</span>
          <strong><i>¥</i>{task.reward}<small>任务奖励</small></strong>
        </div>

        <div className="task-brief">
          <span className="eyebrow">COLLECTION BRIEF</span>
          <h3>采集内容</h3>
          <p>“{task.script}”</p>
        </div>

        <div className="requirement-list">
          <div><span><Mic2 size={17} /></span><p><strong>自然表达</strong>请使用日常语速，无需字正腔圆</p><CheckCircle2 size={17} /></div>
          <div><span><Headphones size={17} /></span><p><strong>安静环境</strong>避免电视、人声与明显回声</p><CheckCircle2 size={17} /></div>
          <div><span><ShieldCheck size={17} /></span><p><strong>由你管理</strong>完成后会生成一张声音卡片</p><CheckCircle2 size={17} /></div>
        </div>

        <button className="primary-button primary-button--large" onClick={() => onStart(task)}>领取任务 · 开始采集</button>
        <p className="legal-note">领取后 24 小时内完成。提交即代表你确认录音为本人真实表达并同意平台质检。</p>
      </section>
    </div>
  )
}
