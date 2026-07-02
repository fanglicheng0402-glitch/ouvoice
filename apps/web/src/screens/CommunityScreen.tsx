import { ArrowRight, Clock3, Coins, Crosshair, MapPin, Radio, TimerReset, Users, Waves } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../contexts'
import { coordinateNumber, getRegionMapTransform, isRegionName, REGION_COORDINATES, type RegionName } from '../lib/regionMap'
import type { VoiceTask } from '../types'

const regionNodes: { name: RegionName; count: number }[] = [
  { name: '鹿城区', count: 842 },
  { name: '瓯海区', count: 516 },
  { name: '永嘉县', count: 301 },
  { name: '瑞安市', count: 427 },
  { name: '乐清市', count: 268 },
  { name: '洞头区', count: 132 },
]

const nodeLinks = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [2, 4], [3, 5], [4, 5]]
const locations = ['鹿城区', '瓯海区', '永嘉县']

export function CommunityScreen({ tasks, onTask }: { tasks: VoiceTask[]; onTask: (task: VoiceTask) => void }) {
  const { state: appState } = useAppStore()
  const activeRegion: RegionName = isRegionName(appState.activeBountyTask?.region) ? appState.activeBountyTask.region : '鹿城区'
  const [focusedRegion, setFocusedRegion] = useState<RegionName | null>(null)
  const mapTransform = useMemo(() => getRegionMapTransform(focusedRegion), [focusedRegion])

  useEffect(() => {
    setFocusedRegion((current) => current ? activeRegion : null)
  }, [activeRegion])

  function toggleActiveRegionFocus() {
    setFocusedRegion((current) => current === activeRegion ? null : activeRegion)
  }

  return (
    <div className="screen community-screen">
      <header className="screen-header cyber-header">
        <div><span className="eyebrow">一起把家乡话留下来</span><h1>乡音共创</h1></div>
        <span className="network-chip"><i /> 2,486 位伙伴</span>
      </header>

      <section className="region-map-card constellation-card">
        <div className="region-map-card__head">
          <div><span className="eyebrow">一针一线，绣出家乡的声音</span><h2>温州乡音地图</h2></div>
          <button
            type="button"
            className={`map-focus-button ${focusedRegion ? 'is-focused' : ''}`}
            aria-label={focusedRegion ? '显示完整温州乡音地图' : `聚焦到我的位置：${activeRegion}`}
            aria-pressed={focusedRegion === activeRegion}
            onClick={toggleActiveRegionFocus}
          ><Crosshair size={17} /></button>
        </div>
        <div className={`region-map constellation-map ${focusedRegion ? 'is-focused' : ''}`} data-focused-region={focusedRegion ?? 'ALL'}>
          <div className="map-scanline" />
          <div className="map-zoom-layer" style={{ transform: mapTransform }} data-testid="dialect-map-zoom-layer">
            <svg className="constellation-radar" viewBox="0 0 100 100" aria-hidden="true">
              <defs><filter id="node-glow"><feGaussianBlur stdDeviation=".45" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
              <g className="radar-rings"><circle cx="50" cy="50" r="15" /><circle cx="50" cy="50" r="29" /><circle cx="50" cy="50" r="43" /><path d="M50 5V95M5 50H95M18 18 82 82M82 18 18 82" /></g>
              <g className="radar-links" filter="url(#node-glow)">
                {nodeLinks.map(([from, to]) => {
                  const fromCoordinate = REGION_COORDINATES[regionNodes[from].name]
                  const toCoordinate = REGION_COORDINATES[regionNodes[to].name]
                  return <line key={`${from}-${to}`} x1={coordinateNumber(fromCoordinate.x)} y1={coordinateNumber(fromCoordinate.y)} x2={coordinateNumber(toCoordinate.x)} y2={coordinateNumber(toCoordinate.y)} />
                })}
              </g>
              <polygon className="radar-surface" points={regionNodes.map((node) => {
                const coordinate = REGION_COORDINATES[node.name]
                return `${coordinateNumber(coordinate.x)},${coordinateNumber(coordinate.y)}`
              }).join(' ')} />
            </svg>
            {regionNodes.map((node) => {
              const coordinate = REGION_COORDINATES[node.name]
              const isActive = node.name === activeRegion
              const isFocused = node.name === focusedRegion
              return (
                <button
                  key={node.name}
                  type="button"
                  aria-label={`查看${node.name}乡音，已有${node.count}段`}
                  aria-pressed={isFocused}
                  className={`map-node constellation-node ${isActive ? 'is-active' : ''} ${isFocused ? 'is-focused' : ''}`}
                  style={{ left: coordinate.x, top: coordinate.y }}
                  onClick={() => setFocusedRegion((current) => current === node.name ? null : node.name)}
                >
                  <i><span /></i><strong>{node.name}</strong><small>{node.count} 段乡音</small>
                </button>
              )
            })}
          </div>
          <span className="radar-bearing radar-bearing--north">北</span>
          <span className="radar-bearing radar-bearing--east">东</span>
          <div className="map-coordinates">温州 · 瓯越大地</div>
        </div>
        <div className="map-legend">
          <span><i className="legend-hot" />乡音较多</span><span><i />正在生长</span><span><Radio size={11} />今天新增 176 段</span>
        </div>
      </section>

      <section className="global-counters" aria-label="全网统计">
        <div>
          <span className="counter-icon counter-icon--teal"><Waves size={18} /></span>
          <span><small>大家一起记录了</small><strong>284,720<i> 分钟</i></strong><b>今天 +1,286</b></span>
        </div>
        <div>
          <span className="counter-icon"><Coins size={18} /></span>
          <span><small>已经回馈给共创者</small><strong><i>¥</i>2,486,391</strong><b>每一份参与都有回应</b></span>
        </div>
      </section>

      <section className="bounty-section bounty-feed-section">
        <div className="section-heading">
          <div><span className="eyebrow">从一个小任务开始</span><h2>等你来记录的乡音</h2></div>
          <span className="bounty-count">还有 {tasks.length} 个</span>
        </div>
        <div className="bounty-feed flex max-h-[calc(100dvh-180px)] touch-pan-y flex-col gap-4 overflow-y-auto overscroll-contain pb-24 pr-0.5">
          {tasks.map((task, index) => {
            const reward = task.reward
            const location = locations[index] ?? task.region
            return (
              <article key={task.id} className="bounty-feed-item">
                <div className="bounty-feed-item__head">
                  <span className={`bounty-rank ${index === 1 ? 'is-boosted' : ''}`}>0{index + 1}</span>
                  <span><strong>{task.dialect}（{location}）</strong><small><MapPin size={10} />{task.category} · {task.expressionStyle ?? '真实自然表达'}</small></span>
                  <span className="rate-per-minute"><strong>¥{reward.toFixed(2)}</strong><small>/ 条</small></span>
                </div>
                <div className="bounty-feed-item__meta">
                  <span><Clock3 size={11} />{task.deadline}</span>
                  <span><TimerReset size={11} />建议 {task.duration.replace('约 ', '')}</span>
                  <span><Users size={11} />剩余 {task.total - task.progress} 份</span>
                </div>
                <button onClick={() => onTask(task)}>我来录这一条<ArrowRight size={14} /></button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="community-pulse">
        <Users size={18} /><span><strong>社区脉冲</strong>过去 24 小时新增 176 段真实乡音</span><i>+12.8%</i>
      </section>
      <div className="screen-spacer" />
    </div>
  )
}
