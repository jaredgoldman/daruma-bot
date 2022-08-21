export default {
  '1005510693707067402': {
    maxAssets: 20,
    minCapacity: 2,
    maxCapacity: 2,
    npcHp: 100,
    imageDir: 'dist/nftAssets',
    playerHp: 100,
    rollInterval: 1000 * 2,
  },
  // test channel
  '1005510628217192579': {
    maxAssets: 20,
    minCapacity: 2,
    maxCapacity: 2,
    npcHp: 100,
    imageDir: 'dist/nftAssets',
    playerHp: 100,
    rollInterval: 1000 * 2,
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
  rollInterval: number
}
