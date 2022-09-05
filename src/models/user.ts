import { InsertOneResult, ObjectId } from 'mongodb'
import { collections } from '../database/database.service'

export default class User {
  private enhancers: { [key: string]: Enhancer }
  private totalBattles: number
  private karma: number
  private coolDowns: { [key: string]: number } // timestamp

  constructor(
    private username: string,
    private discordId: string,
    private address: string,
    private assets: number[]
  ) {
    this.karma = 0
    this.enhancers = {}
    this.coolDowns = {}
    this.totalBattles = 0
    this.karma = 0
  }

  async saveUser(): Promise<InsertOneResult<UserData>> {
    const userEntry: UserData = {
      username: this.username,
      discordId: this.discordId,
      address: this.address,
      assets: this.assets,
      karma: this.karma,
      enhancers: this.enhancers,
      totalBattles: this.totalBattles,
      coolDowns: this.coolDowns,
    }
    return await collections.users.insertOne(userEntry)
  }
}

export interface UserData {
  address: string
  discordId?: string
  username?: string
  assets?: number[]
  karma?: number
  enhancers?: { [key: string]: Enhancer }
  totalBattles?: number
  coolDowns?: { [key: string]: number } // timestamp
  _id?: ObjectId
}

export interface Enhancer {
  type: EnhancerType
  owned: boolean
  // Can add modifiers here
}

enum EnhancerType {
  arms,
  legs,
  meditation,
}
