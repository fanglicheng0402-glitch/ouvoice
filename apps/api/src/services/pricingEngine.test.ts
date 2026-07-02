import { afterEach, describe, expect, it, vi } from 'vitest'
import { PricingEngine, processUsageSession, type Settings } from './pricingEngine.js'

const allEnabled: Settings = {
  privateStorage: true,
  culturalHeritage: true,
  academicUse: true,
  commercialTraining: true,
}

afterEach(() => vi.restoreAllMocks())

describe('PricingEngine', () => {
  it('calculates the same sovereignty rate matrix as the frontend', () => {
    const engine = new PricingEngine()
    expect(engine.calculateRatePerSecond({ ...allEnabled, culturalHeritage: false, academicUse: false, commercialTraining: false })).toBe(0)
    expect(engine.calculateRatePerSecond({ ...allEnabled, academicUse: false, commercialTraining: false })).toBe(.01)
    expect(engine.calculateRatePerSecond({ ...allEnabled, commercialTraining: false })).toBe(.16)
    expect(engine.calculateRatePerSecond(allEnabled)).toBe(.51)
  })

  it('creates a parameterized ledger insertion record for a usage session', () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const record = processUsageSession('REC-WZ-0012', 15.4, allEnabled)

    expect(record.ratePerSecond).toBe(.51)
    expect(record.totalEarnings).toBe(7.854)
    expect(record.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(record.insert.text).toContain('INSERT INTO voice_usage_ledger')
    expect(record.insert.values).toEqual([
      record.timestamp,
      'REC-WZ-0012',
      15.4,
      .51,
      7.854,
      'AI大型模型训练声音产权首次授权权益',
    ])
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('REC-WZ-0012 +¥7.85'),
      expect.objectContaining({ query: expect.any(String), values: record.insert.values }),
    )
  })
})
