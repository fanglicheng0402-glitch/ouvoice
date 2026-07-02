import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeAudioCaptureError, startWavCapture, type AudioCaptureSession, type CapturedWavAudio } from '../services/audioService'

export type RecordingControllerState = 'IDLE' | 'RECORDING' | 'ANALYZING' | 'COMPLETED'

export interface AudioComplianceResult {
  compliant: boolean
  duration: number
  score: number
  message: string
}

const transitions: Record<RecordingControllerState, RecordingControllerState[]> = {
  IDLE: ['RECORDING'],
  RECORDING: ['IDLE', 'ANALYZING'],
  ANALYZING: ['IDLE', 'COMPLETED'],
  COMPLETED: ['IDLE'],
}

const emptyWaveform = Array.from({ length: 30 }, () => 10)

export function useRecordingController() {
  const [state, setState] = useState<RecordingControllerState>('IDLE')
  const [duration, setDuration] = useState(0)
  const [waveform, setWaveform] = useState<number[]>(emptyWaveform)
  const [error, setError] = useState<string | null>(null)
  const [compliance, setCompliance] = useState<AudioComplianceResult | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [wasLengthOverride, setWasLengthOverride] = useState(false)

  const stateRef = useRef<RecordingControllerState>('IDLE')
  const durationRef = useRef(0)
  const captureRef = useRef<AudioCaptureSession | null>(null)
  const timerRef = useRef<number | null>(null)
  const waveformTimerRef = useRef<number | null>(null)
  const workerRef = useRef<Worker | null>(null)

  const transition = useCallback((next: RecordingControllerState) => {
    const current = stateRef.current
    if (current === next) return true
    if (!transitions[current].includes(next)) return false
    stateRef.current = next
    setState(next)
    return true
  }, [])

  const clearIntervals = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    if (waveformTimerRef.current !== null) window.clearInterval(waveformTimerRef.current)
    timerRef.current = null
    waveformTimerRef.current = null
  }, [])

  const releaseAudio = useCallback(() => {
    captureRef.current?.cancel()
    captureRef.current = null
  }, [])

  const finishAudioCapture = useCallback(async (): Promise<CapturedWavAudio | null> => {
    clearIntervals()
    const capture = captureRef.current
    captureRef.current = null
    if (!capture) return null
    const audio = await capture.stop()
    setAudioBlob(audio.blob)
    setAudioUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(audio.blob)
    })
    return audio
  }, [clearIntervals])

  const start = useCallback(async () => {
    if (stateRef.current !== 'IDLE') return false
    try {
      setError(null)
      setCompliance(null)
      setWasLengthOverride(false)
      const capture = await startWavCapture()
      captureRef.current = capture
      durationRef.current = 0
      setDuration(0)
      setWaveform(emptyWaveform)
      transition('RECORDING')

      timerRef.current = window.setInterval(() => {
        durationRef.current += 1
        setDuration(durationRef.current)
      }, 1000)

      waveformTimerRef.current = window.setInterval(() => {
        setWaveform(capture.getWaveformBars(30))
      }, 90)
      return true
    } catch (cause) {
      releaseAudio()
      setError(normalizeAudioCaptureError(cause).userMessage)
      return false
    }
  }, [releaseAudio, transition])

  const runComplianceWorker = useCallback((capturedDuration: number) => new Promise<AudioComplianceResult>((resolve) => {
    const calculate = () => resolve({
      compliant: capturedDuration >= 5,
      duration: capturedDuration,
      score: capturedDuration >= 5 ? Math.min(99, 86 + capturedDuration) : Math.max(8, capturedDuration * 12),
      message: capturedDuration < 5 ? '发现录音中断/过短' : '音频合规检查通过',
    })

    if (typeof Worker === 'undefined') {
      window.setTimeout(calculate, 1500)
      return
    }

    const workerSource = `self.onmessage = function(event) {
      var duration = event.data.duration;
      setTimeout(function() {
        self.postMessage({
          compliant: duration >= 5,
          duration: duration,
          score: duration >= 5 ? Math.min(99, 86 + duration) : Math.max(8, duration * 12),
          message: duration < 5 ? '发现录音中断/过短' : '音频合规检查通过'
        });
      }, 1500);
    };`
    const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }))
    const worker = new Worker(workerUrl)
    workerRef.current = worker
    worker.onmessage = (event: MessageEvent<AudioComplianceResult>) => {
      URL.revokeObjectURL(workerUrl)
      worker.terminate()
      workerRef.current = null
      resolve(event.data)
    }
    worker.onerror = () => {
      URL.revokeObjectURL(workerUrl)
      worker.terminate()
      workerRef.current = null
      window.setTimeout(calculate, 1500)
    }
    worker.postMessage({ duration: capturedDuration })
  }), [])

  const complete = useCallback(async () => {
    if (stateRef.current !== 'RECORDING') return
    clearIntervals()
    if (!transition('ANALYZING')) return
    setError(null)
    let capturedAudio: CapturedWavAudio | null
    try {
      capturedAudio = await finishAudioCapture()
    } catch (cause) {
      setError(normalizeAudioCaptureError(cause).userMessage)
      transition('IDLE')
      return
    }
    const capturedDuration = capturedAudio?.duration ?? durationRef.current
    durationRef.current = Math.floor(capturedDuration)
    setDuration(durationRef.current)
    const result = await runComplianceWorker(capturedDuration)
    setCompliance(result)
    if (!result.compliant) {
      setError(result.message)
      return
    }
    transition('COMPLETED')
  }, [clearIntervals, finishAudioCapture, runComplianceWorker, transition])

  const acceptShortRecording = useCallback(() => {
    if (stateRef.current !== 'ANALYZING' || compliance?.compliant !== false || !audioBlob) return false
    setError(null)
    setCompliance((current) => current ? {
      ...current,
      compliant: true,
      message: '用户确认归档短录音',
    } : current)
    setWasLengthOverride(true)
    return transition('COMPLETED')
  }, [audioBlob, compliance, transition])

  const reset = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    clearIntervals()
    releaseAudio()
    stateRef.current = 'IDLE'
    setState('IDLE')
    durationRef.current = 0
    setDuration(0)
    setWaveform(emptyWaveform)
    setError(null)
    setCompliance(null)
    setWasLengthOverride(false)
    setAudioBlob(null)
    setAudioUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
  }, [clearIntervals, releaseAudio])

  useEffect(() => () => {
    workerRef.current?.terminate()
    clearIntervals()
    releaseAudio()
  }, [clearIntervals, releaseAudio])

  return {
    state,
    duration,
    waveform,
    error,
    compliance,
    audioBlob,
    audioUrl,
    wasLengthOverride,
    start,
    complete,
    acceptShortRecording,
    reset,
  }
}
