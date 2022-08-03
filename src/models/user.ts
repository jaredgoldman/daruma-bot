import { ObjectId } from 'mongodb'

export default class User {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: {
      [key: string]: UserAsset
    },
    public karma: number,
    public losses: number,
    //key: EnhancerType
    public enhancers: { [key: string]: Enhancer },
    public wins?: { [key: string]: number },
    public _id?: ObjectId,
    public coolDowns?: { [key: string]: number } // timestamp
  ) {}
}

export interface UserAsset {
  alias?: string
  wins: number
  losses: number
  kos: number
}

export interface Enhancer {
  type: EnancerType
  owned: boolean
}

type EnancerType = 'arms' | 'legs' | 'meditation'
