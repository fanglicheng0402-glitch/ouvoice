import { ArrowUpRight, Clock3, MapPin } from 'lucide-react'
import type { VoiceTask } from '../types'

export function TaskCard({ task, onSelect, featured = false }: { task: VoiceTask; onSelect: (task: VoiceTask) => void; featured?: boolean }) {
  const remaining = task.total - task.progress
  return (
    <button className={`task-card ${featured ? 'task-card--featured' : ''}`} onClick={() => onSelect(task)}>
      <div className="task-card__topline">
        <span className="micro-tag">{task.category}</span>
        <span className="task-card__deadline"><Clock3 size={12} />{task.deadline}</span>
      </div>
      <h3>{task.title}</h3>
      <div className="task-card__meta">
        <span><MapPin size={13} />{task.dialect}</span>
        <span>{task.duration}</span>
        <span>{task.difficulty}</span>
      </div>
      <div className="task-card__bottom">
        <div>
          <small>本次奖励</small>
          <strong><i>¥</i>{task.reward}</strong>
        </div>
        <div className="task-card__spots">
          <span>剩余 {remaining} 份</span>
          <span className="mini-progress"><i style={{ width: `${(task.progress / task.total) * 100}%` }} /></span>
        </div>
        <span className="round-arrow"><ArrowUpRight size={17} /></span>
      </div>
    </button>
  )
}
