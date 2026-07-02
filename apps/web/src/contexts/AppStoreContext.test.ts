import { describe, expect, it } from 'vitest'
import { appStoreReducer, initialAppStoreState } from './AppStoreContext'

describe('OuVoice central app store', () => {
  it('links a selected bounty task to the recording tab', () => {
    const task = demoTask()
    const withTask = appStoreReducer(initialAppStoreState, { type: 'SET_ACTIVE_BOUNTY_TASK', payload: task })
    const recording = appStoreReducer(withTask, { type: 'SET_TAB', payload: 'record' })
    expect(recording.activeBountyTask?.id).toBe('task-test')
    expect(recording.currentTab).toBe('record')
  })

  it('adds a minted asset and increments global earnings without replacing other state', () => {
    const asset = { id: 'REC-WZ-0012', dialect: '温州话-条目', duration: 12, timestamp: '2026-07-01T00:00:00.000Z', status: '已收录 (待确认)' as const }
    const withAsset = appStoreReducer(initialAppStoreState, { type: 'ADD_ASSET', payload: asset })
    const withEarnings = appStoreReducer(withAsset, { type: 'INCREMENT_EARNINGS', payload: 2.8 })
    expect(withEarnings.userAssets[0].id).toBe('REC-WZ-0012')
    expect(withEarnings.totalEarnings).toBe(Number((initialAppStoreState.totalEarnings + 2.8).toFixed(2)))
  })
})

function demoTask() {
  return {
    id: 'task-test', title: '测试任务', dialect: '温州话', region: '鹿城区', reward: 2.5,
    duration: '约 1 分钟', difficulty: '简单' as const, category: '测试', progress: 0, total: 1,
    deadline: '今天', script: '测试提示词', accentTip: '自然表达',
  }
}
