import { Withdrawal } from '../../models/withdrawal'
import { collections } from '../database.service'

export const saveWithdrawal = async (withdrawal: Withdrawal) => {
  return await collections.tokenWithdrawals.insertOne(withdrawal)
}
