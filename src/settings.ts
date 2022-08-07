export default {
  "1005510693707067402": {
    maxAssets: 20,
    minCapacity: 2,
    maxCapacity: 4
  }
} as Settings

interface Settings {
  [key: string]: ChannelSettings
}

interface ChannelSettings {
  maxAssets: number,
  minCapacity: number
  maxCapacity: number
}

