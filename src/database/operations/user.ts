// Schema
import { InsertOneResult, ObjectId, WithId } from 'mongodb'

import User from '../../models/user'
// Database
import { collections } from '../database.service'

export const findUserById = async (_id: ObjectId): Promise<WithId<User>> =>
  (await collections.users?.findOne({
    _id,
  })) as WithId<User>

export const findUserByDiscordId = async (
  discordId: string
): Promise<WithId<User>> =>
  (await collections.users?.findOne({
    discordId,
  })) as WithId<User>

export const updateUser = async (
  userData: User,
  discordId: string
): Promise<void> => {
  await collections.users.findOneAndReplace({ discordId }, userData)
}

export const saveUser = async (
  userData: User
): Promise<InsertOneResult<User>> => await collections.users.insertOne(userData)

export const updateUserKarma = async (
  discordId: string,
  karma: number
): Promise<void> => {
  await collections.users.findOneAndUpdate({ discordId }, { $set: { karma } })
}
