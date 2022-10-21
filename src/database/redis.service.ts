import Redis from 'ioredis'

import { env } from '../utils/environment'
import { Logger } from '../utils/logger'

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
export let redisClient: Redis
let redisType: string

export async function connectToRedis(): Promise<void> {
  if (env.REDIS_URL) {
    redisClient = new Redis(env.REDIS_URL)
    redisType = 'Server'
  } else {
    redisClient = new RedisMock()
    redisType = 'Mock'
  }

  redisClient.on('ready', function () {
    Logger.info(`Successfully connected to Redis ${redisType}`)
  })
}
