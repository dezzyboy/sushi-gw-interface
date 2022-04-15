import { ChainId, Token } from '@dezzyboy/sushiswap-core-sdk'

export const USDC = new Token(ChainId.GODWOKEN, '0x5f774D8713fF0e5E3579496e4c41b8fd8Be9a2B6', 18, 'USDC', 'USD Coin')

export const USDT = new Token(ChainId.GODWOKEN, '0xFF77EBB2981dCB46590D383C87f40811259CAC70', 18, 'USDT', 'Tether USD')
export const DAI = new Token(
  ChainId.GODWOKEN,
  '0xBCa5910433f509Ac834d7b51a2A94F30c29aB056',
  18,
  'DAI',
  'Dai Stablecoin'
)
export const JIO = new Token(ChainId.GODWOKEN, '0x7397A6156320756b3Af250D191893C7FF89673A4', 18, 'JIO', 'Jioswap Dao')
