export type AudioCaptureErrorCode =
  | 'UNSUPPORTED'
  | 'INSECURE_CONTEXT'
  | 'PERMISSION_DENIED'
  | 'DEVICE_NOT_FOUND'
  | 'DEVICE_BUSY'
  | 'CAPTURE_FAILED'

export class AudioCaptureError extends Error {
  public readonly cause?: unknown

  constructor(
    public readonly code: AudioCaptureErrorCode,
    public readonly userMessage: string,
    options?: { cause?: unknown },
  ) {
    super(userMessage)
    this.name = 'AudioCaptureError'
    this.cause = options?.cause
  }
}

export interface AudioCaptureOptions {
  sampleRate?: number
  channelCount?: 1
  bufferSize?: 2048 | 4096 | 8192
  echoCancellation?: boolean
  noiseSuppression?: boolean
  autoGainControl?: boolean
}

export interface CapturedWavAudio {
  blob: Blob
  duration: number
  sampleRate: number
  channelCount: 1
  mimeType: 'audio/wav'
}

export interface AudioCaptureSession {
  readonly sampleRate: number
  getWaveformBars(count?: number): number[]
  stop(): Promise<CapturedWavAudio>
  cancel(): void
}

const defaultOptions: Required<AudioCaptureOptions> = {
  sampleRate: 48_000,
  channelCount: 1,
  bufferSize: 4096,
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
}

class BrowserWavCaptureSession implements AudioCaptureSession {
  private readonly chunks: Float32Array[] = []
  private stopped = false

  constructor(
    private readonly stream: MediaStream,
    private readonly context: AudioContext,
    private readonly source: MediaStreamAudioSourceNode,
    private readonly analyser: AnalyserNode,
    private readonly processor: ScriptProcessorNode,
    private readonly silentOutput: GainNode,
  ) {
    this.processor.onaudioprocess = (event) => {
      if (this.stopped) return
      this.chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)))
    }
  }

  get sampleRate() {
    return this.context.sampleRate
  }

  getWaveformBars(count = 30): number[] {
    const frame = new Uint8Array(this.analyser.fftSize)
    this.analyser.getByteTimeDomainData(frame)
    const bucketSize = Math.max(1, Math.floor(frame.length / count))

    return Array.from({ length: count }, (_, bucket) => {
      let peak = 0
      const start = bucket * bucketSize
      const end = Math.min(frame.length, start + bucketSize)
      for (let index = start; index < end; index += 1) {
        peak = Math.max(peak, Math.abs(frame[index] - 128) / 128)
      }
      return Math.round(Math.min(100, 12 + peak * 176))
    })
  }

  async stop(): Promise<CapturedWavAudio> {
    if (this.stopped) throw new AudioCaptureError('CAPTURE_FAILED', '录音会话已经结束，请重新开始录制。')
    this.stopped = true
    const samples = mergePcmChunks(this.chunks)
    const sampleRate = this.sampleRate
    await this.release()

    return {
      blob: encodePcm16Wav(samples, sampleRate),
      duration: samples.length / sampleRate,
      sampleRate,
      channelCount: 1,
      mimeType: 'audio/wav',
    }
  }

  cancel() {
    if (this.stopped) return
    this.stopped = true
    this.chunks.length = 0
    void this.release()
  }

  private async release() {
    this.processor.onaudioprocess = null
    this.source.disconnect()
    this.analyser.disconnect()
    this.processor.disconnect()
    this.silentOutput.disconnect()
    this.stream.getTracks().forEach((track) => track.stop())
    if (this.context.state !== 'closed') await this.context.close()
  }
}

export async function startWavCapture(options: AudioCaptureOptions = {}): Promise<AudioCaptureSession> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new AudioCaptureError('UNSUPPORTED', '当前设备浏览器不支持麦克风采集，请升级系统 WebView 或更换浏览器。')
  }
  if (!window.isSecureContext && window.location.hostname !== 'localhost') {
    throw new AudioCaptureError('INSECURE_CONTEXT', '麦克风仅能在 HTTPS 安全连接中使用，请通过安全地址重新打开。')
  }

  const AudioContextConstructor = window.AudioContext
    || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextConstructor) {
    throw new AudioCaptureError('UNSUPPORTED', '当前设备不支持 Web Audio API，无法创建高保真录音。')
  }

  const config = { ...defaultOptions, ...options }
  let stream: MediaStream | null = null
  let context: AudioContext | null = null

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: { ideal: config.channelCount },
        sampleRate: { ideal: config.sampleRate },
        sampleSize: { ideal: 16 },
        echoCancellation: config.echoCancellation,
        noiseSuppression: config.noiseSuppression,
        autoGainControl: config.autoGainControl,
      },
      video: false,
    })
    try {
      context = new AudioContextConstructor({ latencyHint: 'interactive', sampleRate: config.sampleRate })
    } catch (error) {
      const name = typeof error === 'object' && error && 'name' in error ? String(error.name) : ''
      if (name !== 'NotSupportedError') throw error
      context = new AudioContextConstructor({ latencyHint: 'interactive' })
    }
    if (context.state === 'suspended') await context.resume()

    const source = context.createMediaStreamSource(stream)
    const analyser = context.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.72
    const processor = context.createScriptProcessor(config.bufferSize, 1, 1)
    const silentOutput = context.createGain()
    silentOutput.gain.value = 0

    source.connect(analyser)
    source.connect(processor)
    processor.connect(silentOutput)
    silentOutput.connect(context.destination)

    return new BrowserWavCaptureSession(stream, context, source, analyser, processor, silentOutput)
  } catch (error) {
    stream?.getTracks().forEach((track) => track.stop())
    if (context && context.state !== 'closed') await context.close()
    throw normalizeAudioCaptureError(error)
  }
}

export function normalizeAudioCaptureError(error: unknown): AudioCaptureError {
  if (error instanceof AudioCaptureError) return error
  const name = typeof error === 'object' && error && 'name' in error ? String(error.name) : ''

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return new AudioCaptureError('PERMISSION_DENIED', '麦克风权限被拒绝。请在系统设置中允许 OuVoice 使用麦克风后重试。', { cause: error })
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return new AudioCaptureError('DEVICE_NOT_FOUND', '未检测到可用麦克风，请连接录音设备后重试。', { cause: error })
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return new AudioCaptureError('DEVICE_BUSY', '麦克风正被其他应用占用，请关闭其他录音应用后重试。', { cause: error })
  }
  return new AudioCaptureError('CAPTURE_FAILED', '无法启动录音，请检查设备权限和系统音频设置。', { cause: error })
}

export function encodePcm16Wav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2
  const dataSize = samples.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * bytesPerSample, true)
  view.setUint16(32, bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample))
    view.setInt16(44 + index * bytesPerSample, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
  })
  return new Blob([buffer], { type: 'audio/wav' })
}

function mergePcmChunks(chunks: Float32Array[]) {
  const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0)
  const merged = new Float32Array(totalLength)
  let offset = 0
  chunks.forEach((chunk) => {
    merged.set(chunk, offset)
    offset += chunk.length
  })
  return merged
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
}
