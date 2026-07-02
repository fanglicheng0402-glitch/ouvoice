import { describe, expect, it } from 'vitest'
import type { UserAsset } from '../contexts'
import { filterVoiceAssets } from './filterVoiceAssets'

const assets: UserAsset[] = [
  { id: 'REC-WZ-0009', dialect: '温州话-鹿城区', duration: 7, timestamp: '2026-07-01', status: '已收录 (待确认)', title: '街巷叫卖声' },
  { id: 'REC-WZ-0012', dialect: '温州话-瑞安市', duration: 12, timestamp: '2026-07-01', status: '已收录 (由我管理)', title: '海边故事' },
]

describe('filterVoiceAssets', () => {
  it('matches serial, region, title and status text', () => {
    expect(filterVoiceAssets(assets, '0012')).toEqual([assets[1]])
    expect(filterVoiceAssets(assets, '鹿城')).toEqual([assets[0]])
    expect(filterVoiceAssets(assets, '海边')).toEqual([assets[1]])
    expect(filterVoiceAssets(assets, '待确认')).toEqual([assets[0]])
  })

  it('returns all assets for an empty query', () => {
    expect(filterVoiceAssets(assets, '  ')).toEqual(assets)
  })
})
