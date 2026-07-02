import { createHash, randomBytes } from 'node:crypto'

export interface MintReceipt {
  serial: string
  fingerprint: string
  txHash: string
  chainId: string
  metadataUri: string
  mintedAt: string
}

export interface LedgerReceipt {
  ledgerId: string
  blockNumber: number
  txHash: string
  chainId: string
  status: 'CONFIRMED'
  licenseTier: 'ECOSYSTEM_CORE' | 'GLOBAL_TRAINING' | 'RESEARCH_ONLY' | 'NO_AI_USAGE'
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

let serialCursor = 8500
let blockCursor = 910441

export class MockBlockchainService {
  readonly chainId = 'ouvoice-testnet-1'

  async mint(input: { userId: string; recordingId: string; title: string; duration: number }): Promise<MintReceipt> {
    serialCursor += 1
    const serial = `REC-WZ-${serialCursor}`
    const entropy = `${serial}:${input.userId}:${input.recordingId}:${Date.now()}`
    const digest = createHash('sha256').update(entropy).digest('hex')
    const fingerprint = digest.slice(0, 12).toUpperCase().match(/.{1,2}/g)?.join(':') ?? digest.slice(0, 12)
    const txHash = `0x${createHash('sha256').update(`${entropy}:${randomBytes(8).toString('hex')}`).digest('hex')}`

    await new Promise((resolve) => setTimeout(resolve, 90))
    return {
      serial,
      fingerprint,
      txHash,
      chainId: this.chainId,
      metadataUri: `ipfs://ouvoice-metadata/${digest}`,
      mintedAt: new Date().toISOString(),
    }
  }

  async signLicense(input: { assetId: string; offerId: string; ownerId: string }) {
    const agreementHash = createHash('sha256').update(JSON.stringify({ ...input, signedAt: new Date().toISOString() })).digest('hex')
    await new Promise((resolve) => setTimeout(resolve, 70))
    return { agreementHash, txHash: `0x${agreementHash}` }
  }

  async commitMint(input: { assetId: string; serial: string; ownerId: string; licenseTier: LedgerReceipt['licenseTier']; licensePrice: number }): Promise<LedgerReceipt> {
    blockCursor += 1
    const confirmedAt = new Date().toISOString()
    const digest = createHash('sha256').update(JSON.stringify({ ...input, block: blockCursor, confirmedAt, nonce: randomBytes(8).toString('hex') })).digest('hex')
    await new Promise((resolve) => setTimeout(resolve, 340))
    return {
      ledgerId: `OVC-${blockCursor.toString(36).toUpperCase()}-${digest.slice(0, 6).toUpperCase()}`,
      blockNumber: blockCursor,
      txHash: `0x${digest}`,
      chainId: this.chainId,
      status: 'CONFIRMED',
      licenseTier: input.licenseTier,
      licensePrice: input.licensePrice,
      confirmedAt,
    }
  }

  async revokeSovereignty(input: { assetId: string; serial: string; ownerId: string; activeLicenses: number }): Promise<SovereigntyRevocationReceipt> {
    const revokedAt = new Date().toISOString()
    const disconnectedModels = Math.max(input.activeLicenses, 3)
    const digest = createHash('sha256').update(JSON.stringify({ ...input, disconnectedModels, revokedAt, nonce: randomBytes(8).toString('hex') })).digest('hex')
    await new Promise((resolve) => setTimeout(resolve, 240))
    return {
      revocationId: `REVOKE-${digest.slice(0, 10).toUpperCase()}`,
      assetId: input.assetId,
      txHash: `0x${digest}`,
      status: 'REVOKED',
      disconnectedModels,
      revokedAt,
    }
  }
}
