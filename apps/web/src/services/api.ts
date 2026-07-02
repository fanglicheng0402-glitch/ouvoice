export interface MintAssetPayload {
  assetId: string
  region: string
  duration: number
  timestamp: string
  audio: {
    mimeType: string
    sizeBytes: number
    sampleRate?: number
    sha256?: string
  }
  licenseTier?: string
}

export interface CloudMintReceipt {
  assetId: string
  certificateId: string
  transactionHash: string
  status: 'QUEUED' | 'CONFIRMED' | 'FAILED'
  mintedAt: string
  blockNumber?: number
}

export interface AudioUploadPayload {
  file: Blob
  userId: string
  dialectTag: string
  filename?: string
  allowShortArchive?: boolean
}

export interface AudioUploadResult {
  status: 'success'
  asset_id: string
  fingerprint: string
  duration: number
}

export class ApiServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiServiceError'
  }
}

const cloudApiOrigin = (import.meta.env.VITE_CLOUD_API_URL || '').replace(/\/$/, '')
const audioApiOrigin = (import.meta.env.VITE_AUDIO_API_URL || cloudApiOrigin).replace(/\/$/, '')

export async function uploadVoiceAudio(
  payload: AudioUploadPayload,
  options: { signal?: AbortSignal } = {},
): Promise<AudioUploadResult> {
  const form = new FormData()
  form.append('file', payload.file, payload.filename || 'recording.wav')
  form.append('user_id', payload.userId)
  form.append('dialect_tag', payload.dialectTag)
  form.append('allow_short_archive', String(payload.allowShortArchive === true))

  return requestJson<AudioUploadResult>('/api/v1/audio/upload', {
    method: 'POST',
    body: form,
    signal: options.signal,
  }, audioApiOrigin)
}

export async function mintVoiceAsset(
  payload: MintAssetPayload,
  options: { accessToken?: string; signal?: AbortSignal } = {},
): Promise<CloudMintReceipt> {
  return requestJson<CloudMintReceipt>('/api/v1/assets/mint', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `mint-${payload.assetId}`,
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
  })
}

async function requestJson<T>(path: string, init: RequestInit, origin = cloudApiOrigin): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${origin}${path}`, init)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiServiceError('无法连接到 OuVoice 服务，请检查网络后重试。', 0, error)
  }

  const body = await parseResponseBody(response)
  if (!response.ok) {
    const message = typeof body === 'object' && body && 'message' in body
      ? String(body.message)
      : `声音卡片保存失败 (${response.status})`
    throw new ApiServiceError(message, response.status, body)
  }
  return body as T
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  const text = await response.text()
  return text ? { message: text } : null
}
