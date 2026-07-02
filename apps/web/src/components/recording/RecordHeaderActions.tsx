import { FileText, Info, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { UserAgreementModal } from '../legal/UserAgreementModal'

export type HeaderMenuAction = 'logout'
type HeaderMenuItemId = HeaderMenuAction | 'agreement'

const menuItems: { id: HeaderMenuItemId; label: string; english: string; icon: typeof FileText }[] = [
  { id: 'agreement', label: '用户协议', english: 'USER AGREEMENT', icon: FileText },
  { id: 'logout', label: '退出', english: 'LOGOUT', icon: LogOut },
]

export function RecordHeaderActions({ onOpenGuide, onMenuAction }: {
  onOpenGuide: () => void
  onMenuAction?: (action: HeaderMenuAction) => void
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAgreementOpen, setIsAgreementOpen] = useState(false)
  const menuAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return

    function closeOnOutsidePress(event: PointerEvent) {
      if (!menuAreaRef.current?.contains(event.target as Node)) setIsMenuOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMenuOpen])

  function selectMenuItem(action: HeaderMenuItemId) {
    setIsMenuOpen(false)
    if (action === 'agreement') {
      setIsAgreementOpen(true)
      return
    }
    onMenuAction?.(action)
  }

  return (
    <>
    <div ref={menuAreaRef} className="relative flex w-[88px] items-center justify-end gap-2 text-left">
      <button
        type="button"
        className="icon-button"
        onClick={onOpenGuide}
        aria-label="重新打开录音指南"
        data-testid="record-guide-trigger"
      >
        <Info size={18} />
      </button>

      <button
        type="button"
        className={`icon-button ${isMenuOpen ? 'border-gold/35 bg-gold/10 text-gold-300' : ''}`}
        onClick={() => setIsMenuOpen((current) => !current)}
        aria-label={isMenuOpen ? '关闭顶部菜单' : '打开顶部菜单'}
        aria-expanded={isMenuOpen}
        aria-controls="record-header-menu"
        data-testid="header-menu-trigger"
      >
        {isMenuOpen ? <X size={18} /> : <Menu size={19} />}
      </button>

      {isMenuOpen && (
        <div
          id="record-header-menu"
          role="menu"
          aria-label="顶部菜单"
          className="absolute right-0 top-[48px] z-[80] w-[214px] overflow-hidden rounded-cyber border border-gold/20 bg-[#17120df7] px-2 py-3 shadow-[0_24px_65px_rgba(0,0,0,.72)] backdrop-blur-xl"
          data-testid="header-menu"
        >
          <div className="mb-1 border-b border-subtle px-3 pb-2 pt-1 font-mono text-micro tracking-[.08em] text-content-muted">更多选项</div>
          {menuItems.map(({ id, label, english, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => selectMenuItem(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-white/[.04] ${id === 'logout' ? 'text-danger/80' : 'text-content-secondary'}`}
            >
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-white/[.06] bg-white/[.025]"><Icon size={15} /></span>
              <span className="min-w-0 flex-1 text-[10px] font-semibold">{label}<small className="mt-0.5 block font-mono text-micro font-normal text-content-muted">{english}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
    <UserAgreementModal open={isAgreementOpen} onClose={() => setIsAgreementOpen(false)} />
    </>
  )
}
