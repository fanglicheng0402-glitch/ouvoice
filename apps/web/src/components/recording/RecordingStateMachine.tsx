import { AlertTriangle, CheckCircle2, LoaderCircle, Mic2, RotateCcw, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAudioRecorder, type RecordingControllerState } from '../../hooks'
import { formatDuration } from '../../lib/format'

export interface RecordingCompletion {
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
  allowShortArchive: boolean
}

export interface RecordingStateMachineProps {
  onCompleted: (recording: RecordingCompletion) => Promise<void> | void
  onStateChange?: (state: RecordingControllerState) => void
}

const stateFrame: Record<RecordingControllerState, string> = {
  IDLE: 'border-subtle bg-surface',
  RECORDING: 'border-gold/45 bg-gold/[0.08] shadow-glow-gold',
  ANALYZING: 'border-teal/35 bg-teal/[0.06] shadow-glow-teal',
  COMPLETED: 'border-success/30 bg-success/[0.06]',
}

const stateLabel: Record<RecordingControllerState, string> = {
  IDLE: '准备好了',
  RECORDING: '正在录音',
  ANALYZING: '正在检查',
  COMPLETED: '录好了',
}

export function RecordingStateMachine({ onCompleted, onStateChange }: RecordingStateMachineProps) {
  const recorder = useAudioRecorder()
  const [handoffPending, setHandoffPending] = useState(false)
  const completionSent = useRef(false)

  useEffect(() => { onStateChange?.(recorder.state) }, [onStateChange, recorder.state])

  useEffect(() => {
    if (recorder.state !== 'COMPLETED' || completionSent.current) return
    completionSent.current = true
    setHandoffPending(true)
    void Promise.resolve(onCompleted({
      duration: recorder.duration,
      audioBlob: recorder.audioBlob,
      audioUrl: recorder.audioUrl,
      allowShortArchive: recorder.wasLengthOverride,
    }))
      .finally(() => setHandoffPending(false))
  }, [onCompleted, recorder.audioBlob, recorder.audioUrl, recorder.duration, recorder.state, recorder.wasLengthOverride])

  function reset() {
    completionSent.current = false
    setHandoffPending(false)
    recorder.reset()
  }

  return (
    <section className={`relative mt-3 min-h-[320px] overflow-hidden rounded-panel border p-4 shadow-panel transition-all duration-300 ${stateFrame[recorder.state]}`} aria-live="polite">
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid bg-cyber-grid opacity-50" />
      <div className="relative z-10 flex min-h-[286px] flex-col">
        <header className="flex items-center justify-between font-mono text-micro tracking-[.1em] text-content-muted">
          <span className="flex items-center gap-1.5">
            <i className={`h-1.5 w-1.5 rounded-full ${recorder.state === 'RECORDING' ? 'animate-pulse bg-danger shadow-glow-danger' : recorder.state === 'COMPLETED' ? 'bg-success' : 'bg-teal'}`} />
            录音状态
          </span>
          <strong className="font-medium text-content-secondary">{stateLabel[recorder.state]}</strong>
        </header>

        {recorder.state === 'IDLE' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <button type="button" onClick={() => void recorder.start()} className="group relative grid h-28 w-28 place-items-center rounded-full" aria-label="开始录音">
              <i className="absolute inset-1 animate-pulse-glow rounded-full border border-danger/15" />
              <i className="absolute -inset-3 animate-pulse-glow rounded-full border border-danger/10 [animation-delay:-.6s]" />
              <i className="absolute -inset-7 animate-pulse-glow rounded-full border border-danger/5 [animation-delay:-1.2s]" />
              <span className="relative grid h-[74px] w-[74px] place-items-center rounded-full border border-white/60 bg-gradient-to-br from-[#ffd878] via-gold to-[#ef9d26] text-[#4d3114] shadow-glow-gold transition-transform duration-200 group-active:scale-95">
                <Mic2 size={33} />
              </span>
            </button>
            <h2 className="mt-8 text-sm font-semibold text-content-primary">轻点按钮，开始说话</h2>
            <p className="mt-2 text-label text-content-muted">第一次使用时，请允许 OuVoice 使用麦克风</p>
            <span className="mt-4 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 font-mono text-micro text-gold-800">建议至少录 5 秒</span>
            {recorder.error && (
              <div role="alert" className="mt-3 flex max-w-[310px] items-start gap-2 rounded-cyber border border-danger/25 bg-danger/[.07] px-3 py-2.5 text-left text-label leading-5 text-danger shadow-glow-danger">
                <AlertTriangle size={16} className="mt-0.5 flex-none" />
                <span>{recorder.error}</span>
              </div>
            )}
          </div>
        )}

        {recorder.state === 'RECORDING' && (
          <div className="flex flex-1 flex-col pt-5">
            <div className="flex h-24 items-center justify-center gap-[3px] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
              {recorder.waveform.map((height, index) => (
                <i key={index} className="w-[3px] rounded-full bg-gradient-to-t from-[#8d73d7] via-teal to-gold-300 transition-[height] duration-75" style={{ height: `${height}%` }} />
              ))}
            </div>
            <strong className="mt-2 text-center font-mono text-4xl font-normal tracking-[.1em] text-content-primary">{formatDuration(recorder.duration)}</strong>
            <div className="mt-4 grid grid-cols-3 divide-x divide-danger/10 border-y border-danger/10 py-2 font-mono text-micro text-content-muted">
              <span className="text-center">声音大小<strong className="mt-1 block text-content-secondary">-{Math.max(2, 12 - Math.round(recorder.waveform[10] / 10))}.2 dB</strong></span>
              <span className="text-center">录音状态<strong className="mt-1 block text-content-secondary">很稳定</strong></span>
              <span className="text-center">周围环境<strong className="mt-1 block text-content-secondary">安静</strong></span>
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
              <button type="button" onClick={reset} className="flex min-h-12 items-center justify-center gap-2 rounded-cyber border border-white/10 bg-white/[.02] text-label text-content-secondary"><RotateCcw size={17} />重新开始</button>
              <button type="button" onClick={() => void recorder.complete()} className="flex min-h-12 items-center justify-center gap-2 rounded-cyber border border-danger/35 bg-danger/10 text-label font-semibold text-[#ed7b69]"><Square size={14} fill="currentColor" />完成录音</button>
            </div>
          </div>
        )}

        {recorder.state === 'ANALYZING' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            {!recorder.error ? (
              <>
                <div className="relative grid h-24 w-24 place-items-center rounded-full border border-teal/20 bg-teal/5 shadow-glow-teal">
                  <i className="absolute inset-2 animate-slow-spin rounded-full border border-dashed border-teal/30" />
                  <LoaderCircle size={29} className="animate-spin text-teal" />
                </div>
                <h2 className="mt-6 text-sm font-semibold text-content-primary">正在听一听这段录音…</h2>
                <p className="mt-2 text-label text-content-muted">确认声音清楚、连续，并且时长足够</p>
              </>
            ) : (
              <>
                <div className="grid h-16 w-16 place-items-center rounded-full border border-danger/30 bg-danger/10 text-danger shadow-glow-danger"><AlertTriangle size={29} /></div>
                <span className="mt-5 font-mono text-micro tracking-[.08em] text-danger/70">这次没有录完整</span>
                <h2 className="mt-2 text-lg font-semibold text-content-primary">录音有些短，再试一次吧</h2>
                <p className="mt-2 text-label leading-5 text-content-muted">目前录了 {formatDuration(recorder.duration)}，说满 5 秒会更容易听清。</p>
                <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-danger/10"><i className="block h-full rounded-full bg-danger transition-all" style={{ width: `${Math.min(100, recorder.duration / 5 * 100)}%` }} /></div>
                <div className="mt-5 grid w-full grid-cols-2 gap-2">
                  <button type="button" onClick={reset} className="flex min-h-11 items-center justify-center gap-2 rounded-cyber border border-danger/35 bg-danger/10 text-label font-semibold text-danger"><RotateCcw size={17} />重新录制</button>
                  <button type="button" onClick={recorder.acceptShortRecording} className="flex min-h-11 items-center justify-center gap-2 rounded-cyber border border-success/40 bg-success/15 text-label font-semibold text-success shadow-[0_0_20px_rgba(89,200,144,.12)]"><CheckCircle2 size={17} />坚持提交归档</button>
                </div>
              </>
            )}
          </div>
        )}

        {recorder.state === 'COMPLETED' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid h-[72px] w-[72px] place-items-center rounded-full border border-success/25 bg-success/10 text-success shadow-[0_0_24px_rgba(89,200,144,.12)]"><CheckCircle2 size={33} /></div>
            <span className="mt-5 font-mono text-micro tracking-[.08em] text-success">声音清楚，可以保存</span>
            <h2 className="mt-2 text-base font-semibold text-content-primary">这段乡音录好了</h2>
            <strong className="mt-2 font-mono text-2xl font-normal text-success">{formatDuration(recorder.duration)}</strong>
            <p className="mt-2 text-label text-content-muted">{handoffPending ? '正在为它制作声音卡片…' : '声音卡片已经准备好'}</p>
            {handoffPending && <LoaderCircle size={20} className="mt-4 animate-spin text-success" />}
          </div>
        )}
      </div>
    </section>
  )
}
