import Player from '../models/player'
import User from '../models/user'

export type EmbedOptions = Player | User | CooldownContent

export enum EmbedType {
  cooldown = 'cooldown',
  waitingRoom = 'waitingRoom',
  activeGame = 'activeGame',
  win = 'win',
}

export type CooldownContent = {
  fields: {
    name: string
    formattedTimeString: string
    utcTimestamp: number
    assetId: number
  }[]
  page: number
}

export type AssetCoolDown = [assetId: number, utcTimestamp: number]
