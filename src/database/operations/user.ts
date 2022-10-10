import { ObjectId, WithId } from 'mongodb'
import { collections } from '../database.service'
import User from '../../models/user'

export const findUserById = async (_id: ObjectId) =>
  (await collections.users?.findOne({
    _id,
  })) as WithId<User>

export const findUserByDiscordId = async (discordId: string) =>
  (await collections.users?.findOne({
    discordId,
  })) as WithId<User>

export const updateUser = async (userData: User, discordId: string) => {
  return await collections.users.findOneAndReplace({ discordId }, userData)
}

export const saveUser = (userData: User) =>
  collections.users.insertOne(userData)

export const updateUserKarma = async (discordId: string, karma: number) => {
  return await collections.users.findOneAndUpdate(
    { discordId },
    //@ts-ignore
    { $set: { karma } }
  )
}
