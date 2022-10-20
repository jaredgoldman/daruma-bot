import Redis from 'ioredis'

// workaround since type declarations of ioredis-mock do not exist
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisMock = require('ioredis-mock')

export enum redisKeys {
  txnData = 'txnData',
  currentRound = 'current-round',
  assetIds = 'assetIds',
  defaultExpiration = 3600,
  creatorAssetsSync = 'creatorAssetsSync',
}

export const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new RedisMock()
