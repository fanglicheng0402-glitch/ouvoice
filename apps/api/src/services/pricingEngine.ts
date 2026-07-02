export interface Settings {
  privateStorage: boolean
  culturalHeritage: boolean
  academicUse: boolean
  commercialTraining: boolean
}

export type SovereigntySettings = Settings

export interface UsageLedgerRecord {
  timestamp: string
  assetId: string
  durationInSeconds: number
  ratePerSecond: number
  totalEarnings: number
  currency: 'CNY'
  description: 'AI大型模型训练声音产权首次授权权益'
  insert: {
    text: string
    values: readonly [string, string, number, number, number, string]
  }
}

const RATE_CENTS = {
  culturalHeritage: 1,
  academicUse: 15,
  commercialTraining: 35,
} as const

const LEDGER_DESCRIPTION = 'AI大型模型训练声音产权首次授权权益' as const

export class PricingEngine {
  calculateRatePerSecond(settings: Settings): number {
    const rateInCents =
      (settings.culturalHeritage ? RATE_CENTS.culturalHeritage : 0)
      + (settings.academicUse ? RATE_CENTS.academicUse : 0)
      + (settings.commercialTraining ? RATE_CENTS.commercialTraining : 0)

    return rateInCents / 100
  }
}

const pricingEngine = new PricingEngine()

export function processUsageSession(
  assetId: string,
  durationInSeconds: number,
  settings: SovereigntySettings,
): UsageLedgerRecord {
  if (!assetId.trim()) throw new TypeError('assetId must not be empty')
  if (!Number.isFinite(durationInSeconds) || durationInSeconds < 0) {
    throw new RangeError('durationInSeconds must be a finite, non-negative number')
  }

  const ratePerSecond = pricingEngine.calculateRatePerSecond(settings)
  const totalEarnings = Number((ratePerSecond * durationInSeconds).toFixed(4))
  const timestamp = new Date().toISOString()
  const insertText = `INSERT INTO voice_usage_ledger
  (occurred_at, asset_id, duration_seconds, rate_per_second, earnings_cny, description)
VALUES ($1, $2, $3, $4, $5, $6);`
  const values = [
    timestamp,
    assetId,
    durationInSeconds,
    ratePerSecond,
    totalEarnings,
    LEDGER_DESCRIPTION,
  ] as const

  const record: UsageLedgerRecord = {
    timestamp,
    assetId,
    durationInSeconds,
    ratePerSecond,
    totalEarnings,
    currency: 'CNY',
    description: LEDGER_DESCRIPTION,
    insert: { text: insertText, values },
  }

  console.info(
    `[${timestamp}] ${LEDGER_DESCRIPTION} ${assetId} +¥${totalEarnings.toFixed(2)}`,
    { query: insertText, values },
  )
  return record
}
