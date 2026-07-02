import { describe, expect, it } from 'vitest'
import { calculateRecordingReward } from './api'

describe('recording submission reward', () => {
  it('keeps every recording reward between ¥2.00 and ¥3.00', () => {
    expect(calculateRecordingReward(0)).toBe(2)
    expect(calculateRecordingReward(15)).toBe(2.25)
    expect(calculateRecordingReward(60)).toBe(3)
    expect(calculateRecordingReward(600)).toBe(3)
  })
})
