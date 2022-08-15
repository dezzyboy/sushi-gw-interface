import { ChainId, Token } from '@dezzyboy/jiodex-core-sdk'

export const USDC = new Token(
  ChainId.GODWOKEN,
  '0x186181e225dc1Ad85a4A94164232bD261e351C33',
  6,
  'USDC',
  'USDC (via Forcebridge from ETH)'
)

export const USDT = new Token(
  ChainId.GODWOKEN,
  '0x8E019acb11C7d17c26D334901fA2ac41C1f44d50',
  6,
  'USDT',
  'USDT (via Forcebridge from ETH)'
)
export const DAI = new Token(
  ChainId.GODWOKEN,
  '0x2c9Fc6087875646112f66a3C92fEF2d158FAa76e',
  18,
  'DAI',
  'DAI (via Forcebridge from ETH)'
)
export const dCKB = new Token(
  ChainId.GODWOKEN,
  '0x893474456C475E738b13DdA824979bF7a355DE39',
  8,
  'dCKB',
  'DCKB (Via Godwoken Bridge From CKB)'
)

export const BNB = new Token(
  ChainId.GODWOKEN,
  '0xbadb9b25150ee75bb794198658a4d0448e43e528',
  18,
  'BNB|bsc',
  'BNB (Via Force Bridge From BSC)'
)
