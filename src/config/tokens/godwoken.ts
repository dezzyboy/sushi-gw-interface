import { ChainId, Token } from '@dezzyboy/sushiswap-core-sdk'

export const USDC = new Token(ChainId.GODWOKEN, '0x11A3893836e2D723E0326457E5e9E2466281FEE5', 18, 'USDC', 'USD Coin')

export const USDT = new Token(ChainId.GODWOKEN, '0xA2a85cB98bF8ad7B8CA510bc998F8D15a1aeD46d', 18, 'USDT', 'Tether USD')
export const DAI = new Token(
  ChainId.GODWOKEN,
  '0x8aab5FE56f0aD4500BD8e3aE1Fc84ec4c634fE4C',
  18,
  'DAI',
  'Dai Stablecoin'
)
export const JIO = new Token(ChainId.GODWOKEN, '0xb5727223892A38d2Ef7Ca7365dcaC9970A63E82e', 18, 'JIO', 'Jioswap Dao')

export const BNB = new Token(ChainId.GODWOKEN, '0xFB60eBF591bc5e363A24b67518339F0015Ad02eE', 18, 'BNB', 'Wrapped BNB')
