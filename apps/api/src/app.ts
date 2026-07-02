import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { currentUser, state } from './repository.js'
import { MockBlockchainService } from './services/blockchain.js'

const blockchain = new MockBlockchainService()
const recordingSchema = z.object({
  taskId: z.string().min(1).optional(),
  title: z.string().min(2).max(80),
  duration: z.number().int().min(1).max(3600),
})
const mintConfirmationSchema = z.object({
  tier: z.enum(['ECOSYSTEM_CORE', 'GLOBAL_TRAINING', 'RESEARCH_ONLY', 'NO_AI_USAGE']),
})
const mintTierPrices = {
  ECOSYSTEM_CORE: 0,
  GLOBAL_TRAINING: 5,
  RESEARCH_ONLY: 2,
  NO_AI_USAGE: 0,
} as const

export function createApp() {
  const app = express()
  app.use(helmet({ crossOriginResourcePolicy: false }))
  app.use(cors({ origin: process.env.WEB_ORIGIN?.split(',') || true, credentials: true }))
  app.use(express.json({ limit: '2mb' }))
  if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'))

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ouvoice-api', chain: blockchain.chainId }))

  app.get('/api/overview', (_req, res) => res.json({
    profile: currentUser,
    balance: state.balance,
    pending: state.pending,
    totalRevenue: state.totalRevenue,
    tasks: state.tasks,
    assets: state.assets,
    earnings: state.earnings,
  }))

  app.get('/api/tasks', (req, res) => {
    const dialect = typeof req.query.dialect === 'string' ? req.query.dialect : undefined
    res.json({ tasks: dialect ? state.tasks.filter((task) => task.dialect === dialect) : state.tasks })
  })

  app.post('/api/tasks/:taskId/claim', (req, res) => {
    const task = state.tasks.find((item) => item.id === req.params.taskId)
    if (!task) return res.status(404).json({ error: 'TASK_NOT_FOUND', message: '采集任务不存在' })
    if (!task.claimed) {
      task.claimed = true
      task.progress += 1
    }
    return res.json({ task })
  })

  app.post('/api/recordings', async (req, res, next) => {
    try {
      const input = recordingSchema.parse(req.body)
      const task = input.taskId ? state.tasks.find((item) => item.id === input.taskId) : undefined
      const recordingId = `rec-${Date.now()}`
      const receipt = await blockchain.mint({ userId: currentUser.id, recordingId, title: input.title, duration: input.duration })
      const asset = {
        id: `asset-${Date.now()}`,
        serial: receipt.serial,
        title: input.title,
        dialect: task ? `${task.dialect} · ${task.region.slice(2)}` : '温州话 · 鹿城',
        duration: input.duration,
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'REVIEWING' as const,
        fingerprint: receipt.fingerprint,
        txHash: receipt.txHash,
        owner: currentUser.name,
        licenses: 0,
        revenue: 0,
        quality: 94,
        waveform: [28,54,39,72,48,87,61,78,43,69,91,52,76,38,64,82,46,31],
      }
      state.assets.unshift(asset)
      const reward = task?.reward ?? 30
      state.pending += reward
      res.status(201).json({ asset, reward, mintReceipt: receipt })
    } catch (error) { next(error) }
  })

  app.get('/api/assets', (_req, res) => res.json({ assets: state.assets }))
  app.get('/api/assets/:assetId', (req, res) => {
    const asset = state.assets.find((item) => item.id === req.params.assetId)
    return asset ? res.json({ asset }) : res.status(404).json({ error: 'ASSET_NOT_FOUND', message: '原声资产不存在' })
  })

  app.delete('/api/assets/:assetId', (req, res) => {
    const index = state.assets.findIndex((item) => item.id === req.params.assetId)
    if (index === -1) return res.status(404).json({ error: 'ASSET_NOT_FOUND', message: '原声资产不存在' })
    state.assets.splice(index, 1)
    return res.json({ deleted: true, assetId: req.params.assetId })
  })

  app.post('/api/assets/:assetId/mint', async (req, res, next) => {
    try {
      const asset = state.assets.find((item) => item.id === req.params.assetId)
      if (!asset) return res.status(404).json({ error: 'ASSET_NOT_FOUND', message: '原声资产不存在' })
      if (asset.status !== 'REVIEWING') return res.status(409).json({ error: 'ALREADY_MINTED', asset })
      const receipt = await blockchain.mint({ userId: currentUser.id, recordingId: asset.id, title: asset.title, duration: asset.duration })
      Object.assign(asset, { serial: receipt.serial, fingerprint: receipt.fingerprint, txHash: receipt.txHash, status: 'CERTIFIED' as const })
      return res.json({ asset, mintReceipt: receipt })
    } catch (error) { return next(error) }
  })

  app.post('/api/assets/:assetId/confirm-mint', async (req, res, next) => {
    try {
      const { tier } = mintConfirmationSchema.parse(req.body)
      const asset = state.assets.find((item) => item.id === req.params.assetId)
      if (!asset) return res.status(404).json({ error: 'ASSET_NOT_FOUND', message: '原声资产不存在' })
      if (asset.mintConfirmedAt) return res.status(409).json({ error: 'MINT_ALREADY_CONFIRMED', message: '该声音资产已完成确权' })
      const receipt = await blockchain.commitMint({
        assetId: asset.id,
        serial: asset.serial,
        ownerId: currentUser.id,
        licenseTier: tier,
        licensePrice: mintTierPrices[tier],
      })
      Object.assign(asset, {
        status: 'CERTIFIED' as const,
        txHash: receipt.txHash,
        mintLicenseTier: tier,
        mintLicensePrice: receipt.licensePrice,
        mintConfirmedAt: receipt.confirmedAt,
      })
      return res.json({ asset, receipt })
    } catch (error) { return next(error) }
  })

  app.post('/api/assets/:assetId/revoke-sovereignty', async (req, res, next) => {
    try {
      const asset = state.assets.find((item) => item.id === req.params.assetId)
      if (!asset) return res.status(404).json({ error: 'ASSET_NOT_FOUND', message: '原声资产不存在' })
      if (asset.sovereigntyRevokedAt) return res.status(409).json({ error: 'SOVEREIGNTY_ALREADY_REVOKED', message: '该资产已断开全部训练矩阵' })
      const receipt = await blockchain.revokeSovereignty({ assetId: asset.id, serial: asset.serial, ownerId: currentUser.id, activeLicenses: asset.licenses })
      Object.assign(asset, {
        mintLicenseTier: 'NO_AI_USAGE' as const,
        sovereigntyRevokedAt: receipt.revokedAt,
      })
      return res.json({ asset, receipt })
    } catch (error) { return next(error) }
  })

  app.post('/api/assets/:assetId/offers/:offerId/accept', async (req, res, next) => {
    try {
      const asset = state.assets.find((item) => item.id === req.params.assetId)
      const offer = asset?.offer
      if (!asset || !offer || offer.id !== req.params.offerId) return res.status(404).json({ error: 'OFFER_NOT_FOUND', message: '授权邀约不存在' })
      if (offer.status === 'ACCEPTED') return res.status(409).json({ error: 'OFFER_ALREADY_ACCEPTED', message: '该邀约已签署' })
      const receipt = await blockchain.signLicense({ assetId: asset.id, offerId: offer.id, ownerId: currentUser.id })
      offer.status = 'ACCEPTED'
      asset.licenses += 1
      asset.revenue += offer.amount
      asset.status = 'LICENSED'
      state.balance += offer.amount
      state.totalRevenue += offer.amount
      state.earnings.unshift({ id: `earn-${Date.now()}`, title: asset.title, source: 'AI 训练授权', amount: offer.amount, date: new Date().toISOString().slice(5, 10), type: 'LICENSE' })
      return res.json({ asset, balance: state.balance, agreement: receipt })
    } catch (error) { return next(error) }
  })

  app.get('/api/earnings', (_req, res) => res.json({ balance: state.balance, pending: state.pending, total: state.totalRevenue, items: state.earnings }))

  app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND', message: '接口不存在' }))
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.flatten() })
    console.error(error)
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务暂时不可用' })
  })
  return app
}
