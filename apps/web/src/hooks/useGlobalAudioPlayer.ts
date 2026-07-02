import { useCallback, useEffect, useRef, useState } from 'react'

export interface PlayableAsset {
  id: string
  duration: number
  audioUrl?: string
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
}

function createPreviewWav(asset: PlayableAsset) {
  const sampleRate = 8000
  const seconds = Math.min(6, Math.max(2, asset.duration))
  const sampleCount = sampleRate * seconds
  const buffer = new ArrayBuffer(44 + sampleCount * 2)
  const view = new DataView(buffer)
  const seed = [...asset.id].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  const baseFrequency = 160 + (seed % 120)

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + sampleCount * 2, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, sampleCount * 2, true)

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate
    const envelope = Math.min(1, time * 5, (seconds - time) * 4)
    const modulation = .55 + Math.sin(time * 8.3) * .2
    const sample = Math.sin(2 * Math.PI * baseFrequency * time) * modulation * envelope
    view.setInt16(44 + index * 2, sample * 0x2fff, true)
  }
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

export function useGlobalAudioPlayer() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeAssetRef = useRef<string | null>(null)
  const playingIdRef = useRef<string | null>(null)
  const previewUrlsRef = useRef(new Map<string, string>())

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    playingIdRef.current = null
    activeAssetRef.current = null
    setPlayingId(null)
    setProgress(0)
  }, [])

  const toggle = useCallback(async (asset: PlayableAsset) => {
    const currentAudio = audioRef.current

    if (activeAssetRef.current === asset.id && currentAudio) {
      if (playingIdRef.current === asset.id) {
        currentAudio.pause()
        playingIdRef.current = null
        setPlayingId(null)
        return
      }
      await currentAudio.play()
      playingIdRef.current = asset.id
      setPlayingId(asset.id)
      return
    }

    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    let source = asset.audioUrl || previewUrlsRef.current.get(asset.id)
    if (!source) {
      source = createPreviewWav(asset)
      previewUrlsRef.current.set(asset.id, source)
    }

    const nextAudio = new Audio(source)
    nextAudio.preload = 'auto'
    nextAudio.ontimeupdate = () => setProgress(nextAudio.duration ? nextAudio.currentTime / nextAudio.duration : 0)
    nextAudio.onended = () => {
      playingIdRef.current = null
      activeAssetRef.current = null
      setPlayingId(null)
      setProgress(0)
    }
    nextAudio.onerror = () => {
      playingIdRef.current = null
      setPlayingId(null)
    }
    audioRef.current = nextAudio
    activeAssetRef.current = asset.id
    await nextAudio.play()
    playingIdRef.current = asset.id
    setPlayingId(asset.id)
  }, [])

  useEffect(() => () => {
    audioRef.current?.pause()
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrlsRef.current.clear()
  }, [])

  return { playingId, progress, toggle, stop }
}
