export type AssetStatus = 'CERTIFIED' | 'REVIEWING' | 'LICENSED'
export type MintLicenseTier = 'ECOSYSTEM_CORE' | 'GLOBAL_TRAINING' | 'RESEARCH_ONLY' | 'NO_AI_USAGE'

export interface Task {
  id: string; title: string; dialect: string; region: string; reward: number; duration: string
  difficulty: '简单' | '标准' | '进阶'; category: string; progress: number; total: number
  deadline: string; script: string; accentTip: string; claimed?: boolean
}

export interface Offer {
  id: string; company: string; purpose: string; amount: number; duration: string; status: 'PENDING' | 'ACCEPTED'
}

export interface Asset {
  id: string; serial: string; title: string; dialect: string; duration: number; createdAt: string
  status: AssetStatus; fingerprint: string; txHash: string; owner: string; licenses: number
  revenue: number; quality: number; waveform: number[]; offer?: Offer
  mintLicenseTier?: MintLicenseTier; mintLicensePrice?: number; mintConfirmedAt?: string; sovereigntyRevokedAt?: string
}

export interface Earning {
  id: string; title: string; source: string; amount: number; date: string; type: 'TASK' | 'LICENSE'
}
