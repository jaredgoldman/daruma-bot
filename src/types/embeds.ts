import Player from '../models/player'
import User from '../models/user'

export type EmbedOptions = Player | User | CooldownContent

export enum EmbedType {
  cooldown = 'cooldown',
  waitingRoom = 'waitingRoom',
  activeGame = 'activeGame',
  win = 'win',
}

export type CoolDownField = {
  name: string
  formattedTimeString: string
  utcTimestamp: number
  assetId: number
}

export type CooldownContent = {
  fields: CoolDownField[]
  page: number
  totalPages: number
}

export type AssetCoolDown = [assetId: number, utcTimestamp: number]
