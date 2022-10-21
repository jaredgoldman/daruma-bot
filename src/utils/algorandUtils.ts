import algosdk from 'algosdk'
import PendingTransactionInformation from 'algosdk/dist/types/src/client/v2/algod/pendingTransactionInformation'

import { redisClient, redisKeys } from '../database/redis.service'
import Asset from '../models/asset'
import { algoCreatorAssets, algoUserAssets } from '../types/algosdk'
import { TxnStatus } from '../types/token'
import { env } from './environment'
import { Logger } from './logger'

const creatorAddressArr = env.ALGO_CREATOR_ADDRESSES?.split(',')

const token = {
  'X-API-Key': env.ALGO_PURESTAKE_API_TOKEN,
}

const algodClient = new algosdk.Algodv2(token, env.ALGO_NODE, '')
const algoIndexer = new algosdk.Indexer(token, env.ALGO_INDEXER_NODE, '')

export const creatorAssetSync = async function (): Promise<boolean> {
  const assetsSynced = await redisClient.smembers(redisKeys.assetIds)
  if (assetsSynced.length > 0) {
    Logger.debug(
      `Creator Assets are Synchronized with ${assetsSynced.length.toString()} Darumas`
    )
    return true
  }
  let assetIdList: string[] = []
  for (let i = 0; i < creatorAddressArr.length; i++) {
    Logger.debug(`Grabbing Creator assets from: ${creatorAddressArr[i]}`)
    let nextToken = ''
    let creatorAccountInfo: algoCreatorAssets
    //? Loop through all the creator accounts and gather assets
    do {
      if (nextToken == '') {
        creatorAccountInfo = (await algoIndexer
          .lookupAccountCreatedAssets(creatorAddressArr[i])
          .do()) as algoCreatorAssets
        nextToken = creatorAccountInfo['next-token']
        addAssets(creatorAccountInfo)
      } else {
        creatorAccountInfo = (await algoIndexer
          .lookupAccountCreatedAssets(creatorAddressArr[i])
          .nextToken(nextToken)
          .do()) as algoCreatorAssets
        nextToken = creatorAccountInfo['next-token']
        addAssets(creatorAccountInfo)
      }
    } while (creatorAccountInfo['assets'].length > 0)
  }
  //* This adds the assets to REDIS as well as an array of asset id's
  function addAssets(creatorAssets: algoCreatorAssets): void {
    for (let idx = 0; idx < creatorAssets?.assets.length; idx++) {
      let scrutinizedAsset = creatorAssets?.assets[idx]
      let assetId = scrutinizedAsset?.index
      let assetParams = scrutinizedAsset?.params
      redisClient.hmset(assetId.toString(), assetParams)
      assetIdList.push(assetId.toString())
    }
  }
  Logger.debug('Adding Creator assets to Redis')
  await redisClient.sadd(redisKeys.assetIds, ...assetIdList)
  //* Add the delay to prevent resync for 24 hours
  await redisClient.expire(redisKeys.assetIds, redisKeys.defaultExpiration * 24)
  return true
}
const userAssetIds = async function (userWallet: string): Promise<boolean> {
  let optInCheck = false
  let holderAssets: number[] = []
  let accountInfo = (await algoIndexer
    .lookupAccountAssets(userWallet)
    .do()) as algoUserAssets
  for (let idx = 0; idx < accountInfo['assets'].length; idx++) {
    let scrutinizedAsset = accountInfo['assets'][idx]
    if (scrutinizedAsset['asset-id'] == Number(env.ALGO_OPT_IN_ASSET_ID)) {
      optInCheck = true
    }
    if (scrutinizedAsset['amount'] > 0) {
      let assetId = scrutinizedAsset['asset-id']
      holderAssets.push(assetId)
    }
  }
  Logger.debug(`Adding Users Wallet ${userWallet} to Redis`)
  await redisClient.sadd(userWallet, ...holderAssets)
  await redisClient.expire(userWallet, redisKeys.defaultExpiration)
  return optInCheck
}

async function holderCheck(userWallet: string): Promise<Asset[]> {
  const nftsOwned: Asset[] = []
  let creatorAssets = await redisClient.smembers(redisKeys.assetIds)
  let userAssets = await redisClient.smembers(userWallet)
  let curUserAsset: number
  for (let i = 0; i < userAssets.length; i++) {
    for (let j = 0; j < creatorAssets.length; j++) {
      curUserAsset = Number(userAssets[i])
      if (curUserAsset == Number(creatorAssets[j])) {
        let assetParams = await redisClient.hgetall(userAssets[i])
        const { name, url, ['unit-name']: unitName } = assetParams
        nftsOwned.push(new Asset(url, curUserAsset, name, unitName))
      }
    }
  }
  return nftsOwned
}
export const determineOwnership = async function (address: string): Promise<{
  walletOwned: boolean
  nftsOwned: Asset[] | []
}> {
  try {
    await creatorAssetSync()
    //? Opted in boolean
    let walletOwned = false

    //* Grab the Users Assets
    walletOwned = await userAssetIds(address)

    //* Validate they are a holder of Darumas
    const nftsOwned = await holderCheck(address)

    return {
      walletOwned,
      nftsOwned,
    }
  } catch (error) {
    Logger.error('****** ERROR DETERMINING OWNERSHIP ******', error)
    return {
      walletOwned: false,
      nftsOwned: [],
    }
  }
}

export const claimToken = async (
  amount: number,
  receiverAddress: string
): Promise<TxnStatus | undefined> => {
  try {
    const params = await algodClient.getTransactionParams().do()
    const { sk, addr: senderAddress } = algosdk.mnemonicToSecretKey(
      env.ALGO_TOKEN_MNEMONIC
    )

    const revocationTarget = undefined
    const closeRemainderTo = undefined
    const note = undefined

    const xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      senderAddress,
      receiverAddress,
      closeRemainderTo,
      revocationTarget,
      amount,
      note,
      Number(env.ALGO_OPT_IN_ASSET_ID),
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
    Logger.error('Error', error)
  }
}
