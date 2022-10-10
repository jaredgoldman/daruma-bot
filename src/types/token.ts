import PendingTransactionInformation from 'algosdk/dist/types/src/client/v2/algod/pendingTransactionInformation'

export type TxnStatus = {
  status: PendingTransactionInformation
  txId: string
}
