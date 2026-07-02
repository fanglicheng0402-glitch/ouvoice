import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { resetDemoState } from './repository.js'

describe('OuVoice API', () => {
  beforeEach(() => resetDemoState())

  it('returns a complete mobile overview', async () => {
    const response = await request(createApp()).get('/api/overview').expect(200)
    expect(response.body.profile.name).toBe('林晓声')
    expect(response.body.tasks.length).toBeGreaterThan(0)
    expect(response.body.assets[0].serial).toMatch(/^REC-WZ-/)
  })

  it('claims a collection task idempotently', async () => {
    const first = await request(createApp()).post('/api/tasks/task-market/claim').expect(200)
    const second = await request(createApp()).post('/api/tasks/task-market/claim').expect(200)
    expect(first.body.task.claimed).toBe(true)
    expect(second.body.task.progress).toBe(first.body.task.progress)
  })

  it('creates a recording and mocked chain receipt', async () => {
    const response = await request(createApp()).post('/api/recordings').send({ taskId: 'task-market', title: '测试原声', duration: 42 }).expect(201)
    expect(response.body.asset.serial).toMatch(/^REC-WZ-\d{4}$/)
    expect(response.body.asset.fingerprint).toMatch(/^([A-F0-9]{2}:){5}[A-F0-9]{2}$/)
    expect(response.body.mintReceipt.chainId).toBe('ouvoice-testnet-1')
  })

  it('confirms a licensing tier and returns a blockchain ledger receipt', async () => {
    const recording = await request(createApp()).post('/api/recordings').send({ title: '制卡测试原声', duration: 22 }).expect(201)
    const response = await request(createApp())
      .post(`/api/assets/${recording.body.asset.id}/confirm-mint`)
      .send({ tier: 'GLOBAL_TRAINING' })
      .expect(200)
    expect(response.body.asset.status).toBe('CERTIFIED')
    expect(response.body.asset.mintLicensePrice).toBe(5)
    expect(response.body.receipt.status).toBe('CONFIRMED')
    expect(response.body.receipt.txHash).toMatch(/^0x[a-f0-9]{64}$/)
  })
})
