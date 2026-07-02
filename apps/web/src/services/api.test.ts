import { afterEach, describe, expect, it, vi } from 'vitest'
import { mintVoiceAsset, uploadVoiceAudio } from './api'

afterEach(() => vi.unstubAllGlobals())

describe('cloud mint API bridge', () => {
  it('posts verified audio metadata with an idempotency key', async () => {
    const receipt = {
      assetId: 'REC-WZ-0012', certificateId: 'CERT-12', transactionHash: '0xabc',
      status: 'CONFIRMED' as const, mintedAt: '2026-07-01T00:00:00.000Z',
    }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(receipt), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(mintVoiceAsset({
      assetId: 'REC-WZ-0012', region: '鹿城区', duration: 15,
      timestamp: '2026-07-01T00:00:00.000Z',
      audio: { mimeType: 'audio/wav', sizeBytes: 1_440_044, sampleRate: 48_000 },
    })).resolves.toEqual(receipt)

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/assets/mint', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'X-Idempotency-Key': 'mint-REC-WZ-0012' }),
    }))
    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(request.body))).toMatchObject({ assetId: 'REC-WZ-0012', region: '鹿城区', duration: 15 })
  })

  it('uses the FastAPI multipart field contract for audio uploads', async () => {
    const response = { status: 'success', asset_id: 'REC-WZ-0012', fingerprint: 'a'.repeat(64), duration: 15.4 }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await uploadVoiceAudio({
      file: new Blob(['wav'], { type: 'audio/wav' }),
      userId: 'user-wz-001',
      dialectTag: '温州话-鹿城区',
      allowShortArchive: true,
    })

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    const form = request.body as FormData
    expect(url).toBe('/api/v1/audio/upload')
    expect(request.method).toBe('POST')
    expect(form.get('user_id')).toBe('user-wz-001')
    expect(form.get('dialect_tag')).toBe('温州话-鹿城区')
    expect(form.get('allow_short_archive')).toBe('true')
    expect(form.get('file')).toBeInstanceOf(Blob)
  })
})
