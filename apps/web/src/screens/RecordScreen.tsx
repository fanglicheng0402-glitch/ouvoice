import { ArrowLeft, CheckCircle2, FileText, Headphones, ScanLine, ShieldCheck, Type, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { VoiceMintingModal } from '../components/modals'
import { RecordHeaderActions, RecordingGuideModal, RecordingStateMachine, type HeaderMenuAction, type RecordingCompletion } from '../components/recording'
import { Toast } from '../components/ui'
import { useUserAssets } from '../contexts'
import type { RecordingControllerState } from '../hooks'
import type { BlockchainLedgerReceipt, MintLicenseTier, VoiceAsset, VoiceTask } from '../types'

const defaultPrompt = '江蟹生，新鲜个江蟹生！今朝潮水正好，阿妈叫我早点去江边，买两斤转来烧。'

export function RecordScreen({ task, onBack, onSubmit, onMint, standalone = false }: {
  task?: VoiceTask
  onBack: () => void
  onSubmit: (input: {
    taskId?: string
    title: string
    duration: number
    dialectTag: string
    audioBlob: Blob | null
    allowShortArchive: boolean
  }) => Promise<VoiceAsset>
  onMint: (asset: VoiceAsset, tier: MintLicenseTier) => Promise<{ asset: VoiceAsset; receipt: BlockchainLedgerReceipt }>
  standalone?: boolean
}) {
  const { appendAsset } = useUserAssets()
  const [customMode, setCustomMode] = useState(false)
  const [customText, setCustomText] = useState('')
  const [recordingState, setRecordingState] = useState<RecordingControllerState>('IDLE')
  const [sessionKey, setSessionKey] = useState(0)
  const [submitted, setSubmitted] = useState<VoiceAsset | null>(null)
  const [mintAsset, setMintAsset] = useState<VoiceAsset | null>(null)
  const [completedRecording, setCompletedRecording] = useState<RecordingCompletion | null>(null)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [headerMessage, setHeaderMessage] = useState<string | null>(null)
  const activeTask = task || { id: undefined, title: '鹿城街巷叫卖声采集', dialect: '温州话', region: '鹿城区' }
  const promptText = customMode ? customText : (task?.script || defaultPrompt)

  useEffect(() => {
    if (!headerMessage) return
    const timer = window.setTimeout(() => setHeaderMessage(null), 2800)
    return () => window.clearTimeout(timer)
  }, [headerMessage])

  function handleHeaderMenuAction(action: HeaderMenuAction) {
    const messages: Record<HeaderMenuAction, string> = {
      logout: '当前为本地演示模式，无需退出登录',
    }
    setHeaderMessage(messages[action])
  }

  async function handleRecordingCompleted(recording: RecordingCompletion) {
    setCompletedRecording(recording)
    const asset = await onSubmit({
      taskId: activeTask.id,
      title: task?.title || '鹿城街巷叫卖声',
      duration: Math.max(recording.duration, 1),
      dialectTag: `${activeTask.dialect}-${activeTask.region || '鹿城区'}`,
      audioBlob: recording.audioBlob,
      allowShortArchive: recording.allowShortArchive,
    })
    setMintAsset(asset)
  }

  function startAnotherRecording() {
    setSubmitted(null)
    setMintAsset(null)
    setCompletedRecording(null)
    setRecordingState('IDLE')
    setSessionKey((current) => current + 1)
  }

  if (submitted) return (
    <div className="screen record-screen success-screen">
      <div className="success-emblem"><span><ShieldCheck size={34} /></span></div>
      <span className="eyebrow">这段乡音已经收好</span>
      <h1>原声已安全提交</h1>
      <p>谢谢你的参与。它会留在你的声库里，如何使用始终由你决定。</p>
      <div className="submitted-asset"><span>声音卡片编号</span><strong>{submitted.serial}</strong><div><span>当前状态</span><i>已经收好</i></div></div>
      <button className="primary-button primary-button--large" onClick={onBack}>查看我的声库</button>
      <button className="text-button" onClick={startAnotherRecording}>继续采集</button>
      <div className="screen-spacer" />
    </div>
  )

  return (
    <div className="screen record-screen record-workbench">
      <header className="record-header">
        <div className="flex w-[88px] items-center justify-start">{standalone && !task ? null : <button className="icon-button" onClick={onBack} aria-label="返回"><ArrowLeft size={20} /></button>}</div>
        <div className="min-w-0 flex-1 px-1"><span className="eyebrow">记录家乡的声音</span><h1>开始录音</h1></div>
        <RecordHeaderActions onOpenGuide={() => setIsGuideOpen(true)} onMenuAction={handleHeaderMenuAction} />
      </header>

      <section className="active-dialect-bar">
        <span className="dialect-signal"><i /><ScanLine size={16} /></span>
        <span><small>这次要记录</small><strong>{activeTask.dialect} · {activeTask.region || '鹿城区'}</strong></span>
        <i className="task-live">进行中</i>
      </section>

      <section className="prompt-card">
        <div className="prompt-card__head">
          <span><FileText size={14} /> 读一读这段话</span>
          <button onClick={() => setCustomMode((value) => !value)} className={customMode ? 'is-active' : ''}><Type size={13} />{customMode ? '使用任务文本' : '自定义文本'}</button>
        </div>
        {customMode ? <textarea value={customText} onChange={(event) => setCustomText(event.target.value)} placeholder="输入你想朗读或讲述的内容…" autoFocus /> : <blockquote><i>“</i>{promptText}<i>”</i></blockquote>}
        <div className="prompt-card__foot"><span>自然语速 · 保留方言语气词</span><span>{promptText.length || 0} CHARS</span></div>
      </section>

      <RecordingStateMachine key={sessionKey} onCompleted={handleRecordingCompleted} onStateChange={setRecordingState} />

      <div className="environment-checks">
        <div className="is-good"><Volume2 size={17} /><span>环境噪声<small>良好 · -46 dB</small></span><CheckCircle2 size={16} /></div>
        <div className="is-good"><Headphones size={17} /><span>录音设备<small>已经准备好</small></span><CheckCircle2 size={16} /></div>
      </div>
      <p className="legal-note">每一段声音，都由你决定如何保存和使用</p>
      <div className="screen-spacer" />

      {mintAsset && <VoiceMintingModal asset={mintAsset} onConfirm={onMint} onComplete={(asset) => {
        appendAsset({
          id: asset.serial,
          dialect: `${activeTask.dialect}-条目`,
          duration: asset.duration,
          timestamp: new Date().toISOString(),
          status: '已收录 (待确认)',
          title: asset.title,
          audioUrl: completedRecording?.audioUrl || undefined,
          audioBlob: completedRecording?.audioBlob || undefined,
          sourceAssetId: asset.id,
        })
        setMintAsset(null)
        setSubmitted(asset)
      }} />}
      <RecordingGuideModal open={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      {headerMessage && <Toast message={headerMessage} onClose={() => setHeaderMessage(null)} />}
    </div>
  )
}

