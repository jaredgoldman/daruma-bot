import PendingTransactionInformation from 'algosdk/dist/types/src/client/v2/algod/pendingTransactionInformation'

interface creatorAsset {
  'created-at-round': number
  deleted: boolean
  index: number
  params: {
    clawback: string
    creator: string
    decimals: number
    'default-frozen': boolean
    freeze: string
    manager: string
    name: string
    'name-b64': string
    reserve: string
    total: number
    'unit-name': string
    'unit-name-b64': string
    url: string
    'url-b64': string
  }
}

export interface algoCreatorAssets {
  assets: creatorAsset[]
  'current-round': number
  'next-token': string
}

interface userAsset {
  amount: any
  'asset-id': number
  deleted: boolean
  'is-frozen': boolean
  'opted-in-at-round': number
  'opted-out-at-round'?: number
}

export interface algoUserAssets {
  assets: userAsset[]
  'current-round': number
  'next-token': string
}

export type TxnStatus = {
  status: PendingTransactionInformation
  txId: string
}
