import { ArrowRight, Bell, ChevronRight, CircleDollarSign, Flame, MapPinned, ShieldCheck, Sparkles } from 'lucide-react'
import type { Overview, VoiceAsset, VoiceTask } from '../types'
import { Brand } from '../components/Brand'
import { TaskCard } from '../components/TaskCard'
import { AssetCard } from '../components/AssetCard'
import { formatMoney } from '../lib/format'

export function HomeScreen({ data, onTask, onAsset, onNavigate }: {
  data: Overview
  onTask: (task: VoiceTask) => void
  onAsset: (asset: VoiceAsset) => void
  onNavigate: (tab: 'tasks' | 'assets' | 'profile') => void
}) {
  const firstName = data.profile.name.slice(-2)
  return (
    <div className="screen home-screen">
      <header className="home-header">
        <Brand />
        <button className="icon-button notification-button" aria-label="通知"><Bell size={20} /><i /></button>
      </header>

      <section className="welcome-line">
        <div><span className="eyebrow">今天也来听听家乡吧</span><h1>你好，{firstName}</h1></div>
        <button className="avatar" onClick={() => onNavigate('profile')}>{data.profile.initials}<i><ShieldCheck size={11} /></i></button>
      </section>

      <section className="balance-card">
        <div className="balance-orbit balance-orbit--one" />
        <div className="balance-orbit balance-orbit--two" />
        <div className="balance-card__head"><span>我的声音回馈</span><span className="chain-live"><i /> 已更新</span></div>
        <small>目前可提现</small>
        <strong className="balance-value"><i>¥</i>{formatMoney(data.balance)}</strong>
        <div className="balance-card__foot">
          <span>待结算<strong>¥ {formatMoney(data.pending)}</strong></span>
          <span>累计收益<strong>¥ {formatMoney(data.totalRevenue)}</strong></span>
          <button onClick={() => onNavigate('profile')}>资产账单<ArrowRight size={14} /></button>
        </div>
      </section>

      <section className="streak-card">
        <span className="streak-icon"><Flame size={20} /></span>
        <div><strong>连续守护家乡原声 {data.profile.contributionDays} 天</strong><span>你的声音，让方言在数字世界继续生长</span></div>
        <ChevronRight size={17} />
      </section>

      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>为你推荐的采集</h2></div><button onClick={() => onNavigate('tasks')}>全部任务<ArrowRight size={14} /></button></div>
        <TaskCard task={data.tasks[0]} onSelect={onTask} featured />
      </section>

      <section className="map-callout">
        <div className="map-dots" aria-hidden="true">{Array.from({ length: 28 }, (_, index) => <i key={index} />)}</div>
        <div className="map-callout__icon"><MapPinned size={24} /></div>
        <div><span className="eyebrow">DIALECT ATLAS</span><h3>点亮你的方言坐标</h3><p>温州地区已有 <strong>2,486</strong> 位原声守护者</p></div>
        <ArrowRight size={17} />
      </section>

      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">熟悉的声音都在这里</span><h2>最近收下的乡音</h2></div><button onClick={() => onNavigate('assets')}>去声库看看<ArrowRight size={14} /></button></div>
        <AssetCard asset={data.assets[0]} onSelect={onAsset} />
      </section>

      <section className="trust-strip">
        <div><Sparkles size={18} /><span>真实原声<small>人工质检</small></span></div>
        <div><ShieldCheck size={18} /><span>由你管理<small>使用都有记录</small></span></div>
        <div><CircleDollarSign size={18} /><span>持续收益<small>授权即分成</small></span></div>
      </section>
      <div className="screen-spacer" />
    </div>
  )
}
