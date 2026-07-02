import { createContext, useContext, type ReactNode } from 'react'
import { useGlobalAudioPlayer } from '../hooks/useGlobalAudioPlayer'

type AudioPlaybackContextValue = ReturnType<typeof useGlobalAudioPlayer>
const AudioPlaybackContext = createContext<AudioPlaybackContextValue | null>(null)

export function AudioPlaybackProvider({ children }: { children: ReactNode }) {
  const player = useGlobalAudioPlayer()
  return <AudioPlaybackContext.Provider value={player}>{children}</AudioPlaybackContext.Provider>
}

export function useAudioPlayback() {
  const context = useContext(AudioPlaybackContext)
  if (!context) throw new Error('useAudioPlayback must be used inside AudioPlaybackProvider')
  return context
}
