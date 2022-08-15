import { Currency, CurrencyAmount } from '@dezzyboy/jiodex-core-sdk'

export interface Assets {
  asset: CurrencyAmount<Currency>
  strategy?: { token: string; apy: number; targetPercentage: number; utilization: number }
}
