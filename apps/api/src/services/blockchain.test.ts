import { describe, expect, it } from 'vitest'
import { MockBlockchainService } from './blockchain.js'

describe('MockBlockchainService', () => {
  it('commits a selected minting tier to a unique ledger receipt', async () => {
    const chain = new MockBlockchainService()
    const receipt = await chain.commitMint({
      assetId: 'asset-test',
      serial: 'REC-WZ-0018',
      ownerId: 'usr-test',
      licenseTier: 'GLOBAL_TRAINING',
      licensePrice: 5,
    })

    expect(receipt.status).toBe('CONFIRMED')
    expect(receipt.licenseTier).toBe('GLOBAL_TRAINING')
    expect(receipt.licensePrice).toBe(5)
    expect(receipt.ledgerId).toMatch(/^OVC-/)
    expect(receipt.txHash).toMatch(/^0x[a-f0-9]{64}$/)
  })

  it('returns an auditable sovereignty revocation receipt', async () => {
    const chain = new MockBlockchainService()
    const receipt = await chain.revokeSovereignty({ assetId: 'asset-9', serial: 'REC-WZ-0009', ownerId: 'usr-test', activeLicenses: 4 })
    expect(receipt.status).toBe('REVOKED')
    expect(receipt.disconnectedModels).toBe(4)
    expect(receipt.revocationId).toMatch(/^REVOKE-/)
    expect(receipt.txHash).toMatch(/^0x[a-f0-9]{64}$/)
  })
})
