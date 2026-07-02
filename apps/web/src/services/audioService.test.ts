import { describe, expect, it } from 'vitest'
import { encodePcm16Wav, normalizeAudioCaptureError } from './audioService'

describe('audioService', () => {
  it('encodes PCM samples as a valid 16-bit mono WAV blob', async () => {
    const blob = encodePcm16Wav(new Float32Array([0, .5, -1, 1]), 48_000)
    const view = new DataView(await blob.arrayBuffer())
    const text = (offset: number, length: number) => String.fromCharCode(...Array.from({ length }, (_, index) => view.getUint8(offset + index)))

    expect(blob.type).toBe('audio/wav')
    expect(blob.size).toBe(52)
    expect(text(0, 4)).toBe('RIFF')
    expect(text(8, 4)).toBe('WAVE')
    expect(view.getUint32(24, true)).toBe(48_000)
    expect(view.getUint16(34, true)).toBe(16)
  })

  it('maps denied microphone access to a UI-safe error', () => {
    const error = normalizeAudioCaptureError({ name: 'NotAllowedError' })
    expect(error.code).toBe('PERMISSION_DENIED')
    expect(error.userMessage).toContain('麦克风权限被拒绝')
  })
})
