import { demoOverview } from '../data/demo'
import type { BlockchainLedgerReceipt, MintLicenseTier, Overview, SovereigntyRevocationReceipt, VoiceAsset, VoiceTask } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) throw new Error(`请求失败 (${response.status})`)
  return response.json() as Promise<T>
}

export async function getOverview(): Promise<Overview> {
  try {
    return await request<Overview>('/overview')
  } catch {
    return structuredClone(demoOverview)
  }
}

export function claimTask(taskId: string): Promise<{ task: VoiceTask }> {
  return request(`/tasks/${taskId}/claim`, { method: 'POST' })
}

export async function createRecording(input: {
  taskId?: string
  title: string
  duration: number
}): Promise<{ asset: VoiceAsset; reward: number }> {
  const reward = calculateRecordingReward(input.duration)
  try {
    const result = await request<{ asset: VoiceAsset; reward: number }>('/recordings', { method: 'POST', body: JSON.stringify(input) })
    return { ...result, reward }
  } catch {
    const serial = `REC-WZ-${Math.floor(1000 + Math.random() * 8999)}`
    return {
      reward,
      asset: {
        id: `asset-${Date.now()}`,
        serial,
        title: input.title,
        dialect: '温州话 · 鹿城',
        duration: input.duration,
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'REVIEWING',
        fingerprint: '生成中',
        txHash: '等待上链',
        owner: '林晓声',
        licenses: 0,
        revenue: 0,
        quality: 94,
        waveform: [28, 54, 39, 72, 48, 87, 61, 78, 43, 69, 91, 52, 76, 38, 64, 82, 46, 31],
      },
    }
  }
}

export function calculateRecordingReward(duration: number) {
  const normalizedDuration = Math.min(60, Math.max(0, duration))
  return Number((2 + normalizedDuration / 60).toFixed(2))
}

export async function acceptOffer(assetId: string, offerId: string): Promise<{ asset: VoiceAsset; balance: number }> {
  return request(`/assets/${assetId}/offers/${offerId}/accept`, { method: 'POST' })
}

const mintPrices: Record<MintLicenseTier, number> = {
  ECOSYSTEM_CORE: 0,
  GLOBAL_TRAINING: 2,
  RESEARCH_ONLY: .5,
  NO_AI_USAGE: 0,
}

export async function confirmVoiceMint(asset: VoiceAsset, tier: MintLicenseTier): Promise<{ asset: VoiceAsset; receipt: BlockchainLedgerReceipt }> {
  try {
    const result = await request<{ asset: VoiceAsset; receipt: BlockchainLedgerReceipt }>(`/assets/${asset.id}/confirm-mint`, { method: 'POST', body: JSON.stringify({ tier }) })
    const licensePrice = mintPrices[tier]
    return {
      asset: { ...result.asset, mintLicensePrice: licensePrice },
      receipt: { ...result.receipt, licensePrice },
    }
  } catch {
    const confirmedAt = new Date().toISOString()
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    return {
      asset: { ...asset, status: 'CERTIFIED', txHash, mintLicenseTier: tier, mintLicensePrice: mintPrices[tier], mintConfirmedAt: confirmedAt },
      receipt: {
        ledgerId: `OVC-${Date.now().toString(36).toUpperCase()}`,
        blockNumber: 910442,
        txHash,
        chainId: 'ouvoice-testnet-1',
        status: 'CONFIRMED',
        licenseTier: tier,
        licensePrice: mintPrices[tier],
        confirmedAt,
      },
    }
  }
}

export async function revokeAssetSovereignty(asset: VoiceAsset): Promise<{ asset: VoiceAsset; receipt: SovereigntyRevocationReceipt }> {
  try {
    return await request(`/assets/${asset.id}/revoke-sovereignty`, { method: 'POST' })
  } catch {
    const revokedAt = new Date().toISOString()
    return {
      asset: { ...asset, mintLicenseTier: 'NO_AI_USAGE', sovereigntyRevokedAt: revokedAt },
      receipt: {
        revocationId: `REVOKE-${Date.now().toString(36).toUpperCase()}`,
        assetId: asset.id,
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        status: 'REVOKED',
        disconnectedModels: Math.max(asset.licenses, 3),
        revokedAt,
      },
    }
  }
}

export async function deleteVoiceAsset(assetId: string): Promise<{ deleted: true; assetId: string }> {
  try {
    return await request(`/assets/${assetId}`, { method: 'DELETE' })
  } catch {
    return { deleted: true, assetId }
  }
}
