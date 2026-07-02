import type { UserAsset } from '../contexts'

export function filterVoiceAssets(assets: UserAsset[], query: string): UserAsset[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  if (!normalizedQuery) return assets

  return assets.filter((asset) => [
    asset.id,
    asset.dialect,
    asset.title,
    asset.status,
    asset.duration,
  ].filter(Boolean).join(' ').toLocaleLowerCase('zh-CN').includes(normalizedQuery))
}
