import { ObjectId } from 'mongodb'
import Asset from './asset'

export default class User {
  public enhancers: { [key: string]: Enhancer }
  public totalBattles: number
  public karma: number
  public coolDowns: { [key: string]: number } // timestamp
  _id?: ObjectId
  created: number

  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: { [key: string]: Asset }
  ) {
    this.karma = 0
    this.enhancers = {}
    this.coolDowns = {}
    this.totalBattles = 0
    this.karma = 0
    this.created = Date.now()
  }
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
