import { ObjectId } from 'mongodb'
import Asset from './asset'

// This model represents a player enrolled in a battle
export default class Player {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public asset: Asset,
    public userId: ObjectId,
    public rounds: { [key: number]: Round },
    public totalScore: number
  ) {
    this.rounds = {}
  }
}

export interface Roll {
  damage: number
  roundNumber: number
  numberRolled: number
  isWin: boolean
}

export interface Round {
  rolls: Roll[]
  totalDamage: number
}

export type Players = { [key: string]: Player }
