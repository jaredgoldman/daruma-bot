export default {
  '1005510693707067402': {
    maxAssets: 20,
    minCapacity: 2,
    maxCapacity: 4,
    npcHp: 100,
    imageDir: 'dist/nftAssets',
    playerHp: 100,
  },
} as Settings

interface Settings {
  [key: string]: ChannelSettings
}

interface ChannelSettings {
  maxAssets: number
  minCapacity: number
  maxCapacity: number
  npcHp: number
  imageDir: string
  playerHp: number
}
