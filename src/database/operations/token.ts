import { Withdrawal } from '../../models/withdrawal'
import { collections } from '../database.service'

export const saveWithdrawal = async (withdrawal: Withdrawal): Promise<void> => {
  await collections.tokenWithdrawals.insertOne(withdrawal)
}
