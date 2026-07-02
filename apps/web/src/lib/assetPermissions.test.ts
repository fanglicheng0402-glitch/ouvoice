import { describe, expect, it } from 'vitest'
import { calculateCurrentAssetRate, defaultAssetPermissions, sovereignRecallPermissions } from './assetPermissions'

describe('asset permission revenue synchronization', () => {
  it('adds each active authorization rate', () => {
    expect(calculateCurrentAssetRate({ privateStorage: true, culturalHeritage: false, academicUse: false, commercialTraining: false })).toBe(0)
    expect(calculateCurrentAssetRate({ privateStorage: true, culturalHeritage: true, academicUse: false, commercialTraining: false })).toBe(.10)
    expect(calculateCurrentAssetRate({ privateStorage: true, culturalHeritage: true, academicUse: true, commercialTraining: false })).toBe(.60)
    expect(calculateCurrentAssetRate(defaultAssetPermissions)).toBe(2.10)
  })

  it('returns zero after sovereign recall', () => {
    expect(sovereignRecallPermissions).toEqual({ privateStorage: true, culturalHeritage: false, academicUse: false, commercialTraining: false })
    expect(calculateCurrentAssetRate(sovereignRecallPermissions)).toBe(0)
  })
})
