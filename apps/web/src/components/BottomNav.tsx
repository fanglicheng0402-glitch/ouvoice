import { AudioLines, Boxes, Landmark, MapPinned } from 'lucide-react'
import { PRODUCT_TABS, type ProductTabId } from '../config/product'

export type TabId = ProductTabId

const icons = {
  record: AudioLines,
  vault: Boxes,
  community: MapPinned,
  assets: Landmark,
} satisfies Record<TabId, typeof AudioLines>

export function BottomNav({ current, onChange }: { current: TabId; onChange: (tab: TabId) => void }) {
  return (
    <footer className="footer-shell">
      <nav className="bottom-nav" aria-label="主要导航">
        {PRODUCT_TABS.map(({ id, label }) => {
          const Icon = icons[id]
          return (
          <button key={id} className={current === id ? 'is-active' : ''} onClick={() => onChange(id)} aria-current={current === id ? 'page' : undefined}>
            <Icon size={21} strokeWidth={1.7} />
            <span>{label}</span>
          </button>
          )
        })}
      </nav>
    </footer>
  )
}
