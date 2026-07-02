# OuVoice frontend structure

```text
apps/web/
├── public/
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── ui/               # Brand, waveform, cards, toast public exports
│   │   ├── layouts/          # Bottom navigation and app-shell exports
│   │   ├── modals/           # Minting, task, and asset detail modal exports
│   │   ├── recording/        # Tailwind RecordingStateMachine component
│   │   └── *.tsx             # Component implementations
│   ├── screens/
│   │   ├── RecordScreen.tsx
│   │   ├── AssetsScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   └── RevenueScreen.tsx
│   ├── hooks/
│   │   ├── useAudioRecorder.ts       # Four-state recorder public API
│   │   ├── useRecordingController.ts # Web Audio/worker implementation
│   │   ├── useGlobalAudioPlayer.ts   # One-at-a-time Vault playback
│   │   ├── useAssetManager.ts        # Asset select/add/update/remove
│   │   └── index.ts
│   ├── contexts/
│   │   ├── AppStoreContext.tsx      # Central reducer: tab, assets, earnings, bounty
│   │   ├── UserAssetsContext.tsx    # AppStore compatibility adapter for feature hooks
│   │   ├── AudioPlaybackContext.tsx # Global single-track playback
│   │   ├── AssetAuthorizationContext.tsx # Per-asset permission matrix
│   │   └── index.ts
│   ├── mockData/
│   │   ├── bounties.ts
│   │   ├── earnings.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── assetPermissions.ts
│   │   └── format.ts
│   ├── services/
│   │   ├── audioService.ts   # Real Web Audio PCM capture and WAV encoder
│   │   ├── api.ts            # Cloud mint REST bridge
│   │   └── index.ts
│   ├── styles/
│   │   └── theme.css         # Global tokens, base theme, cyber utilities
│   ├── styles.css            # Tailwind layers and feature/component styles
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── tailwind.config.js        # Full OuVoice palette and motion system
├── postcss.config.js
└── vite.config.ts
```

## Import conventions

```ts
import { Brand, Toast, Waveform } from '@/components/ui'
import { BottomNav } from '@/components/layouts'
import { VoiceMintingModal } from '@/components/modals'
import { RecordingStateMachine } from '@/components/recording'
import { useAudioRecorder, useAssetManager } from '@/hooks'
import { AppStoreProvider, useAppStore } from '@/contexts'
import { mockBounties, mockEarnings } from '@/mockData'
```

The current Vite build uses relative paths. Add `@` → `src` aliases to `vite.config.ts` and `tsconfig.app.json` if alias imports are adopted throughout the application.
