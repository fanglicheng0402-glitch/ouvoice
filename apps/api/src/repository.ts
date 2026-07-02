import type { Asset, Earning, Task } from './domain.js'

export const currentUser = {
  id: 'usr-lin', name: '林晓声', initials: '林', region: '浙江 · 温州', dialect: '吴语瓯江片',
  verified: true, contributorLevel: 4, contributionDays: 28,
}

export const state: { balance: number; pending: number; totalRevenue: number; tasks: Task[]; assets: Asset[]; earnings: Earning[] } = {
  balance: 1286.4,
  pending: 328,
  totalRevenue: 4832.6,
  tasks: [
    { id: 'task-market', title: '清晨菜市场 · 生活叙事', dialect: '温州话', region: '浙江温州', reward: 86, duration: '约 4 分钟', difficulty: '标准', category: '生活纪实', progress: 72, total: 100, deadline: '剩余 2 天', script: '请用最自然的方言，讲讲你记忆里清晨菜市场的声音、气味，以及常听到的一句吆喝。', accentTip: '像和老朋友聊天一样，不必刻意放慢语速。' },
    { id: 'task-weather', title: '家乡天气 · 自然表达', dialect: '台州话', region: '浙江台州', reward: 62, duration: '约 3 分钟', difficulty: '简单', category: '自由表达', progress: 45, total: 80, deadline: '剩余 5 天', script: '请描述今天的天气，以及这样的天气里你最喜欢做的一件事。', accentTip: '保留你平时的语气词和停顿。' },
    { id: 'task-story', title: '老城旧事 · 口述记忆', dialect: '温州话', region: '浙江温州', reward: 128, duration: '约 8 分钟', difficulty: '进阶', category: '文化留存', progress: 19, total: 50, deadline: '剩余 7 天', script: '讲述一段发生在老城街巷里的真实往事，可以关于家人、邻居或一家老店。', accentTip: '请避免念稿，让记忆自然展开。' },
  ],
  assets: [
    { id: 'asset-8421', serial: 'REC-WZ-8421', title: '江心屿的夏夜记忆', dialect: '温州话 · 鹿城', duration: 184, createdAt: '2026-06-28', status: 'LICENSED', fingerprint: '8F:2A:71:C9:04:E6', txHash: '0x91c4…a7e2', owner: '林晓声', licenses: 3, revenue: 680, quality: 96, waveform: [24,43,30,68,51,82,45,72,91,48,66,38,74,53,86,42,62,32], offer: { id: 'offer-1', company: '澜声智能科技', purpose: '语音识别模型训练 · 非独占', amount: 480, duration: '12 个月', status: 'PENDING' } },
    { id: 'asset-8396', serial: 'REC-WZ-8396', title: '外婆教我讲的童谣', dialect: '温州话 · 瑞安', duration: 96, createdAt: '2026-06-25', status: 'CERTIFIED', fingerprint: '5D:7B:10:A8:F2:31', txHash: '0x77ab…92d1', owner: '林晓声', licenses: 0, revenue: 128, quality: 98, waveform: [38,69,46,82,53,73,35,88,62,41,77,52,92,60,80,44,68,31] },
    { id: 'asset-8368', serial: 'REC-WZ-8368', title: '巷口早餐店的一天', dialect: '温州话 · 瓯海', duration: 242, createdAt: '2026-06-22', status: 'REVIEWING', fingerprint: '1C:AA:42:9F:76:B0', txHash: '等待上链', owner: '林晓声', licenses: 0, revenue: 0, quality: 91, waveform: [22,46,38,72,49,85,55,78,41,68,88,51,71,34,64,82,43,29] },
  ],
  earnings: [
    { id: 'earn-1', title: '江心屿的夏夜记忆', source: 'AI 训练授权', amount: 480, date: '06-29', type: 'LICENSE' },
    { id: 'earn-2', title: '老城方言自由表达', source: '采集任务奖励', amount: 128, date: '06-25', type: 'TASK' },
    { id: 'earn-3', title: '外婆教我讲的童谣', source: '内容收录奖励', amount: 96, date: '06-21', type: 'TASK' },
  ],
}

export function resetDemoState() {
  state.balance = 1286.4
  state.pending = 328
  state.tasks.forEach((task) => { task.claimed = false })
  const offer = state.assets[0]?.offer
  if (offer) offer.status = 'PENDING'
}
