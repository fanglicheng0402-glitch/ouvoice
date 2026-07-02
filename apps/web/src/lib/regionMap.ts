export const REGION_COORDINATES = {
  '鹿城区': { x: '50%', y: '50%', scale: 1.8 },
  '瓯海区': { x: '30%', y: '70%', scale: 2 },
  '永嘉县': { x: '45%', y: '30%', scale: 2 },
  '瑞安市': { x: '64%', y: '76%', scale: 2 },
  '乐清市': { x: '76%', y: '31%', scale: 2 },
  '洞头区': { x: '84%', y: '62%', scale: 2.1 },
} as const

export type RegionName = keyof typeof REGION_COORDINATES

export function isRegionName(value: string | undefined): value is RegionName {
  return Boolean(value && value in REGION_COORDINATES)
}

export function coordinateNumber(value: `${number}%`): number {
  return Number.parseFloat(value)
}

export function getRegionMapTransform(region: RegionName | null): string {
  if (!region) return 'translate(0%, 0%) scale(1)'
  const coordinate = REGION_COORDINATES[region]
  const x = coordinateNumber(coordinate.x)
  const y = coordinateNumber(coordinate.y)
  return `translate(${50 - x * coordinate.scale}%, ${50 - y * coordinate.scale}%) scale(${coordinate.scale})`
}
