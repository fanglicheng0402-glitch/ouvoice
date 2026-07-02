import { ArrowDownToLine, BadgeCheck, Banknote, ChevronRight, CircleHelp, FileText, Fingerprint, Headphones, History, LogOut, Settings, ShieldCheck, WalletCards } from 'lucide-react'
import type { Overview } from '../types'
import { formatMoney } from '../lib/format'

export function ProfileScreen({ data, onToast }: { data: Overview; onToast: (message: string) => void }) {
  const menu = [
    { label: '身份与声纹认证', note: '已认证', icon: Fingerprint },
    { label: '授权管理', note: `${data.assets.reduce((sum, item) => sum + item.licenses, 0)} 份有效授权`, icon: FileText },
    { label: '隐私与数据安全', note: '', icon: ShieldCheck },
    { label: '采集设备检测', note: '状态良好', icon: Headphones },
  ]

  return (
    <div className="screen profile-screen">
      <header className="screen-header profile-title">
        <div><span className="eyebrow">我的乡音足迹</span><h1>我的 OuVoice</h1></div>
        <button className="icon-button" aria-label="设置"><Settings size={19} /></button>
      </header>

      <section className="identity-card">
        <div className="identity-avatar">{data.profile.initials}<i><BadgeCheck size={16} /></i></div>
        <div className="identity-main"><h2>{data.profile.name}<span><ShieldCheck size={12} />实名守护者</span></h2><p>{data.profile.region} · {data.profile.dialect}</p><div className="level-track"><i style={{ width: '68%' }} /></div><small>原声守护等级 LV.{data.profile.contributorLevel} · 再采集 3 份升级</small></div>
      </section>

      <section className="wallet-card">
        <div className="wallet-card__top"><span><WalletCards size={17} />我的收益账户</span><i>已实名</i></div>
        <small>可提现（CNY）</small><strong><i>¥</i>{formatMoney(data.balance)}</strong>
        <div className="wallet-actions">
          <button onClick={() => onToast('提现申请已进入安全验证')}><ArrowDownToLine size={17} />提现</button>
          <button onClick={() => onToast('已为你打开全部资产账单')}><History size={17} />账单</button>
        </div>
      </section>

      <section className="earnings-section">
        <div className="section-heading"><div><span className="eyebrow">RECENT EARNINGS</span><h2>近期收益</h2></div><button>全部<ChevronRight size={14} /></button></div>
        <div className="earning-list">
          {data.earnings.map((item) => (
            <div key={item.id}>
              <span className={item.type === 'LICENSE' ? 'earning-icon earning-icon--teal' : 'earning-icon'}>{item.type === 'LICENSE' ? <FileText size={17} /> : <Banknote size={17} />}</span>
              <span><strong>{item.title}</strong><small>{item.source} · {item.date}</small></span>
              <b>+ ¥{item.amount.toFixed(2)}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-menu">
        {menu.map(({ label, note, icon: Icon }) => <button key={label}><span><Icon size={18} /></span><strong>{label}</strong>{note && <small>{note}</small>}<ChevronRight size={16} /></button>)}
      </section>

      <section className="support-menu">
        <button><CircleHelp size={17} />帮助与客服<ChevronRight size={15} /></button>
        <button><LogOut size={17} />退出登录<ChevronRight size={15} /></button>
      </section>
      <p className="app-version">OuVoice 1.0.0 · 让每一种乡音拥有姓名</p>
      <div className="screen-spacer" />
    </div>
  )
}
