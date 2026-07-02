export type AssetStatus = 'CERTIFIED' | 'REVIEWING' | 'LICENSED'
export type MintLicenseTier = 'ECOSYSTEM_CORE' | 'GLOBAL_TRAINING' | 'RESEARCH_ONLY' | 'NO_AI_USAGE'

export interface BlockchainLedgerReceipt {
  ledgerId: string
  blockNumber: number
  txHash: string
  chainId: string
  status: 'CONFIRMED'
  licenseTier: MintLicenseTier
  licensePrice: number
  confirmedAt: string
}

export interface SovereigntyRevocationReceipt {
  revocationId: string
  assetId: string
  txHash: string
  status: 'REVOKED'
  disconnectedModels: number
  revokedAt: string
}

export interface VoiceTask {
  id: string
  title: string
  dialect: string
  region: string
  reward: number
  duration: string
  difficulty: '简单' | '标准' | '进阶'
  category: string
  expressionStyle?: string
  progress: number
  total: number
  deadline: string
  script: string
  accentTip: string
  claimed?: boolean
}

export interface LicenseOffer {
  id: string
  company: string
  purpose: string
  amount: number
  duration: string
  status: 'PENDING' | 'ACCEPTED'
}

export interface VoiceAsset {
  id: string
  serial: string
  title: string
  dialect: string
  duration: number
  createdAt: string
  status: AssetStatus
  fingerprint: string
  txHash: string
  owner: string
  licenses: number
  revenue: number
  quality: number
  waveform: number[]
  audioUrl?: string
  offer?: LicenseOffer
  mintLicenseTier?: MintLicenseTier
  mintLicensePrice?: number
  mintConfirmedAt?: string
  sovereigntyRevokedAt?: string
}

export interface EarningItem {
  id: string
  title: string
  source: string
  amount: number
  date: string
  type: 'TASK' | 'LICENSE'
}

export interface UserProfile {
  id: string
  name: string
  initials: string
  region: string
  dialect: string
  verified: boolean
  contributorLevel: number
  contributionDays: number
}

export interface Overview {
  profile: UserProfile
  balance: number
  pending: number
  totalRevenue: number
  assets: VoiceAsset[]
  tasks: VoiceTask[]
  earnings: EarningItem[]
}
