import { AlgoAsset, AlgoAssetData, Txn, TxnData } from '../types/user'
import { asyncForEach, wait } from './sharedUtils'
import algosdk from 'algosdk'
import fs from 'fs'
import Asset from '../models/asset'

// import txnDataJson from '../txnData/txnData.json'
import { creatorAddressArr, txnDataJSON } from '..'

import { getChannelSettings } from '../database/operations/game'
import PendingTransactionInformation from 'algosdk/dist/types/src/client/v2/algod/pendingTransactionInformation'
import { TxnStatus } from '../types/token'

const algoNode = process.env.ALGO_NODE as string
const pureStakeApi = process.env.PURESTAKE_API_TOKEN as string
const algoIndexerNode = process.env.ALGO_INDEXER_NODE as string
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID)
const tokenMnemonic = process.env.TOKEN_MNEMONIC as string

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
    const txnData = await convergeTxnData(creatorAddressArr, true)
    fs.writeFileSync(txnDataJSON, JSON.stringify(txnData))

    let { assets } = await algoIndexer
      .lookupAccountAssets(address)
      .limit(10000)
      .do()

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
      const result = uniqueAssets.findIndex(
        (item) => asset['asset-id'] === item['asset-id']
      )
      if (result <= -1 && asset.amount > 0) {
        uniqueAssets.push(asset)
      }
    })

    // console.log(uniqueAssets)

    const data = getTxnData() as TxnData
    const assetIdArr = getAssetIdArrayFromTxnData(data)
    // Determine which assets are part of bot collection
    let collectionAssetLength = 0
    const assetsOwned = uniqueAssets.filter((asset) => {
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
export const getAssetIdArrayFromTxnData = (txnData: TxnData): number[] => {
  const assetIdArr: number[] = []

  txnData.transactions.forEach((txn: Txn) => {
    const assetId = txn['asset-config-transaction']['asset-id']
    const createdAssetId = txn['created-asset-index']
    if (assetId) {
      const result = assetIdArr.findIndex((item) => item === assetId)
      result <= -1 && assetIdArr.push(assetId)
    }
    if (createdAssetId) {
      const result2 = assetIdArr.findIndex((item) => item === createdAssetId)
      result2 <= -1 && assetIdArr.push(createdAssetId)
    }
  })
  return assetIdArr
}

export const isAssetCollectionAsset = (
  assetId: number,
  assetIdArr: number[]
): boolean => assetIdArr.includes(assetId)

export const findAsset = async (
  assetId: number
): Promise<AlgoAssetData | undefined> => {
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
    const { sk, addr: senderAddress } =
      algosdk.mnemonicToSecretKey(tokenMnemonic)

    const revocationTarget = undefined
    const closeRemainderTo = undefined
    const note = undefined
    const assetId = optInAssetId

    let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
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
    let xtx = await algodClient.sendRawTransaction(rawSignedTxn).do()
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
export const searchForTransactions = async (
  address: string
): Promise<TxnData> => {
  const type = 'acfg'
  const txns = (await algoIndexer
    .searchForTransactions()
    .address(address)
    .txType(type)
    .do()) as TxnData

  return txns
}

export const updateTransactions = async (
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
) => {
  const updateCalls: any[] = []
  const txnData = getTxnData() as TxnData
  creatorAddresses.forEach((address: string) => {
    if (update) {
      const currentRound = txnData['current-round']
      updateCalls.push(updateTransactions(address, currentRound))
    } else {
      updateCalls.push(searchForTransactions(address))
    }
  })
  const txnDataArr = await Promise.all(updateCalls)
  const reduceArr = [...txnDataArr]
  if (update) {
    const currentTxnData = getTxnData() as TxnData
    reduceArr.push(currentTxnData)
  }

  return reduceTxnData(reduceArr)
}

const reduceTxnData = (txnDataArray: TxnData[]) => {
  const reducedData = txnDataArray.reduce(
    (prevTxnData: TxnData, txnData: TxnData) => {
      return {
        ['current-round']:
          prevTxnData['current-round'] < txnData['current-round']
            ? prevTxnData['current-round']
            : txnData['current-round'],
        ['next-token']: prevTxnData['next-token'],
        transactions: [...prevTxnData.transactions, ...txnData.transactions],
      }
    }
  )
  // console.log(util.inspect(reducedData, { depth: 1 }))
  return reducedData
}

const getTxnData = (): TxnData | undefined => {
  try {
    return JSON.parse(fs.readFileSync(txnDataJSON, 'utf-8'))
  } catch (e) {
    ///
  }
}
