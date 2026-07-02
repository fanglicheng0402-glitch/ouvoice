import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { TaskCard } from '../components/TaskCard'
import type { VoiceTask } from '../types'

const filters = ['为你推荐', '温州话', '文化留存', '高奖励']

export function TasksScreen({ tasks, onTask }: { tasks: VoiceTask[]; onTask: (task: VoiceTask) => void }) {
  const [filter, setFilter] = useState(filters[0])
  const [query, setQuery] = useState('')
  const results = useMemo(() => tasks.filter((task) => {
    const searchMatch = !query || `${task.title}${task.dialect}${task.category}`.includes(query)
    const filterMatch = filter === '为你推荐'
      || (filter === '温州话' && task.dialect === '温州话')
      || (filter === '文化留存' && task.category === '文化留存')
      || (filter === '高奖励' && task.reward >= 100)
    return searchMatch && filterMatch
  }), [filter, query, tasks])

  return (
    <div className="screen tasks-screen">
      <header className="screen-header">
        <div><span className="eyebrow">从一件小事开始共创</span><h1>乡音小任务</h1></div>
        <button className="icon-button" aria-label="筛选"><SlidersHorizontal size={19} /></button>
      </header>
      <div className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索方言、地区或主题" /><button>温州 <ChevronDown size={13} /></button></div>
      <div className="filter-row" role="tablist">
        {filters.map((item) => <button key={item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <div className="task-summary"><span><i />当前地区任务池实时更新</span><strong>{results.length} 个任务</strong></div>
      <div className="task-list">
        {results.map((task, index) => <TaskCard key={task.id} task={task} onSelect={onTask} featured={index === 0} />)}
        {!results.length && <div className="empty-state"><Search size={28} /><h3>暂时没有匹配的任务</h3><p>换个关键词或筛选条件试试看</p></div>}
      </div>
      <div className="screen-spacer" />
    </div>
  )
}
