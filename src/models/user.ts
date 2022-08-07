import { ObjectId } from 'mongodb'

export default class User {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: {
      [key: string]: UserAsset
    },
    public karma?: number,
    //key: EnhancerType
    public enhancers?: { [key: string]: Enhancer },
    public totalBattles?: number,
    public _id?: ObjectId,
    public coolDowns?: { [key: string]: number } // timestamp
  ) {
    this.karma = 0
    this.enhancers = {}
    this.totalBattles = 0
    this._id = undefined
    this.coolDowns = {}
  }
}

export interface UserAsset {
  assetId: number
  url: string
  assetName: string
  unitName: string
  wins: number
  losses: number
  kos: number
  alias?: string
}

export interface Enhancer {
  type: EnhancerType
  owned: boolean
  // Can add modifiers here
}

export interface UserUpdateObject {
  username?: string,
  discordId?: string,
  address?: string,
  assets?: {
    [key: string]: UserAsset
  },
  karma?: number,
  //key: EnhancerType
  enhancers?: { [key: string]: Enhancer },
  totalBattles?: number,
  _id?: ObjectId,
  coolDowns?: { [key: string]: number } // timestamp
}

enum EnhancerType {
  arms,
  legs,
  meditation,
}
