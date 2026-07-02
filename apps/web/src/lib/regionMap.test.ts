import { describe, expect, it } from 'vitest'
import { getRegionMapTransform, isRegionName, REGION_COORDINATES } from './regionMap'

describe('region map focus transform', () => {
  it('centers the active region at the configured zoom level', () => {
    expect(getRegionMapTransform('鹿城区')).toBe('translate(-40%, -40%) scale(1.8)')
    expect(getRegionMapTransform('瓯海区')).toBe('translate(-10%, -90%) scale(2)')
  })

  it('restores the complete map and validates supported regions', () => {
    expect(getRegionMapTransform(null)).toBe('translate(0%, 0%) scale(1)')
    expect(isRegionName('永嘉县')).toBe(true)
    expect(isRegionName('杭州市')).toBe(false)
    expect(Object.keys(REGION_COORDINATES)).toHaveLength(6)
  })
})
