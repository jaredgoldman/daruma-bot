import algosdk from 'algosdk'
import PendingTransactionInformation from 'algosdk/dist/types/src/client/v2/algod/pendingTransactionInformation'
import Redis from 'ioredis'

import { getChannelSettings } from '../database/operations/game'
import Asset from '../models/asset'
import { TxnStatus } from '../types/token'
import { AlgoAsset, AlgoAssetData, Txn, TxnData } from '../types/user'
import { asyncForEach, wait } from './sharedUtils'

// workaround since type declarations of ioredis-mock do not exist
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisMock = require('ioredis-mock')

function getRedisClient(): any {
  switch (process.env.NODE_ENV) {
    case 'test': {
      console.log('Mocking Redis')
      return new RedisMock()
    }
    case 'dev': {
      console.log('Redis is in Local Dev Mode')

      return new Redis()
    }
    default: {
      const redisUrl = process.env.REDIS_URL || ''
      console.log('Redis has been configured with a URL')
      return new Redis(redisUrl)
    }
  }
}
const redisClient = getRedisClient()
const creatorAddresses = process.env.CREATOR_ADDRESSES as string
const creatorAddressArr = creatorAddresses?.split(',')

const pureStakeApi = process.env.PURESTAKE_API_TOKEN as string
const algoNode = process.env.ALGO_NODE || 'https://mainnet-algorand.api.purestake.io/ps2'
const algoIndexerNode =
  process.env.ALGO_INDEXER_NODE || 'https://mainnet-algorand.api.purestake.io/idx2'
export const optInAssetId = Number(process.env.OPT_IN_ASSET_ID) || 832356628 // This is the Daruma opt-in
export const unitName = process.env.UNIT_NAME || 'Daruma'

const tokenMnemonic = process.env.TOKEN_MNEMONIC || ''

const token = {
  'X-API-Key': pureStakeApi,
}
const server = algoNode
const indexerServer = algoIndexerNode
const port = ''

const algodClient = new algosdk.Algodv2(token, server, port)
const algoIndexer = new algosdk.Indexer(token, indexerServer, port)

export const determineOwnership = async function (
  address: string,
  channelId: string
): Promise<{
  walletOwned: boolean
  nftsOwned: Asset[] | []
}> {
  try {
    // First update transactions
    const data = await getTxnData()
    const { assets } = await algoIndexer.lookupAccountAssets(address).limit(10000).do()

    const settings = await getChannelSettings(channelId)

    let walletOwned = false
    const nftsOwned: Asset[] = []

    // Create array of unique assetIds
    const uniqueAssets: AlgoAsset[] = []

    assets.forEach((asset: AlgoAsset) => {
      // Check if opt-in asset
      if (asset['asset-id'] === Number(optInAssetId)) {
        walletOwned = true
      }
      // ensure no duplicate assets
      const result = uniqueAssets.findIndex(item => asset['asset-id'] === item['asset-id'])
      if (result <= -1 && asset.amount > 0) {
        uniqueAssets.push(asset)
      }
    })

    // console.log(uniqueAssets)

    const assetIdArr = getAssetIdArrayFromTxnData(data)
    // Determine which assets are part of bot collection
    let collectionAssetLength = 0
    const assetsOwned = uniqueAssets.filter(asset => {
      const assetId = asset['asset-id']
      if (
        collectionAssetLength < settings.maxAssets &&
        isAssetCollectionAsset(assetId, assetIdArr)
      ) {
        collectionAssetLength++
        return true
      }
    })

    // fetch data for each asset but not too quickly
    await asyncForEach(assetsOwned, async (asset: AlgoAsset) => {
      const assetId = asset['asset-id']
      const assetData = await findAsset(assetId)
      if (assetData) {
        const { name, url, ['unit-name']: unitName } = assetData.params

        nftsOwned.push(new Asset(url, assetId, name, unitName))
        // Add asset to db
      }
      await wait(250)
    })

    return {
      walletOwned,
      nftsOwned,
    }
  } catch (error) {
    console.log('****** ERROR DETERMINING OWNERSHIP ******', error)
    return {
      walletOwned: false,
      nftsOwned: [],
    }
  }
}

// get array of unique assetIds from txnData
const getAssetIdArrayFromTxnData = (txnData: TxnData): number[] => {
  const assetIdArr: number[] = []

  txnData.transactions.forEach((txn: Txn) => {
    const assetId = txn['asset-config-transaction']['asset-id']
    const createdAssetId = txn['created-asset-index']
    if (assetId) {
      const result = assetIdArr.findIndex(item => item === assetId)
      result <= -1 && assetIdArr.push(assetId)
    }
    if (createdAssetId) {
      const result2 = assetIdArr.findIndex(item => item === createdAssetId)
      result2 <= -1 && assetIdArr.push(createdAssetId)
    }
  })
  return assetIdArr
}

const isAssetCollectionAsset = (assetId: number, assetIdArr: number[]): boolean =>
  assetIdArr.includes(assetId)

const findAsset = async (assetId: number): Promise<AlgoAssetData | undefined> => {
  try {
    const assetData = await algoIndexer.searchForAssets().index(assetId).do()
    if (assetData?.assets) return assetData.assets[0]
  } catch (error) {
    console.log(error)
  }
}

export const claimToken = async (
  amount: number,
  receiverAddress: string
): Promise<TxnStatus | undefined> => {
  try {
    const params = await algodClient.getTransactionParams().do()
    const { sk, addr: senderAddress } = algosdk.mnemonicToSecretKey(tokenMnemonic)

    const revocationTarget = undefined
    const closeRemainderTo = undefined
    const note = undefined
    const assetId = optInAssetId

    const xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      senderAddress,
      receiverAddress,
      closeRemainderTo,
      revocationTarget,
      amount,
      note,
      assetId,
      params
    )
    const rawSignedTxn = xtxn.signTxn(sk)
    const xtx = await algodClient.sendRawTransaction(rawSignedTxn).do()
    const status = (await algosdk.waitForConfirmation(
      algodClient,
      xtx.txId,
      4
    )) as PendingTransactionInformation
    return {
      status,
      txId: xtx.txId,
    }
  } catch (error) {
    console.log(error)
  }
}

// Finds all transactions from address
const searchForTransactions = async (address: string): Promise<TxnData> => {
  const type = 'acfg'
  const txns = (await algoIndexer
    .searchForTransactions()
    .address(address)
    .txType(type)
    .limit(50000)
    .do()) as TxnData

  return txns
}

const updateTransactions = async (
  accountAddress: string,
  currentRound: number
): Promise<TxnData> => {
  const type = 'acfg'
  return (await algoIndexer
    .searchForTransactions()
    .address(accountAddress)
    .txType(type)
    .minRound(currentRound)
    .do()) as TxnData
}

// Fetches all data and reduces it to one object
export const convergeTxnData = async (
  creatorAddresses: string[],
  update: boolean
): Promise<TxnData> => {
  console.log('Gathering txnData')
  const updateCalls: Promise<TxnData>[] = []
  const currentRound = await getCurrentRound()
  creatorAddresses.forEach((address: string) => {
    if (currentRound > 0) {
      updateCalls.push(updateTransactions(address, currentRound))
    } else {
      updateCalls.push(searchForTransactions(address))
    }
  })
  const txnDataArr = await Promise.all(updateCalls)
  const reduceArr = [...txnDataArr]
  if (update && currentRound > 0) {
    const currentTxnData = await getTxnData()
    reduceArr.push(currentTxnData)
  }

  return reduceTxnData(reduceArr)
}

const reduceTxnData = (txnDataArray: TxnData[]): TxnData => {
  const reducedData = txnDataArray.reduce((prevTxnData: TxnData, txnData: TxnData) => {
    return {
      ['current-round']:
        prevTxnData['current-round'] < txnData['current-round']
          ? prevTxnData['current-round']
          : txnData['current-round'],
      ['next-token']: prevTxnData['next-token'],
      transactions: [...prevTxnData.transactions, ...txnData.transactions],
    }
  })
  // console.log(util.inspect(reducedData, { depth: 1 }))
  return reducedData
}

export const getTxnData = async (): Promise<TxnData> => {
  const defaultExpiration = 3600
  const redisKey = 'txnData'
  const redisCurrentRound = 'txnData.current-round'
  let txnData: TxnData
  const value = await redisClient.get(redisKey)
  if (value) {
    txnData = JSON.parse(value)
  } else {
    txnData = await convergeTxnData(creatorAddressArr, false)
    redisClient.setex(redisKey, defaultExpiration, JSON.stringify(txnData))
    redisClient.setex(redisCurrentRound, defaultExpiration, txnData['current-round'].toString())
  }
  return txnData
}

export const getCurrentRound = async (): Promise<number> => {
  const redisCurrentRound = 'txnData.current-round'
  const value = await redisClient.get(redisCurrentRound)
  if (value) {
    return Number(value)
  }
  return 0
}
