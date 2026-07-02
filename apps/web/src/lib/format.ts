export function formatMoney(value: number) {
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export function formatDuration(value: number) {
  const minutes = Math.floor(value / 60).toString().padStart(2, '0')
  const seconds = (value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

export const statusLabel = {
  CERTIFIED: '已保存',
  REVIEWING: '审核中',
  LICENSED: '授权中',
} as const
