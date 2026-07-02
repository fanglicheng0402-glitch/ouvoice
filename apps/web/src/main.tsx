import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppStoreProvider, AssetAuthorizationProvider, AudioPlaybackProvider } from './contexts'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppStoreProvider>
      <AssetAuthorizationProvider>
        <AudioPlaybackProvider><App /></AudioPlaybackProvider>
      </AssetAuthorizationProvider>
    </AppStoreProvider>
  </React.StrictMode>,
)
