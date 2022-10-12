import { ColorResolvable, Attachment } from 'discord.js'
import Player from '../models/player'

/*
 * Embed component types
 */
export interface EmbedData {
  title?: string
  description?: string
  color?: ColorResolvable
  image?: string
  thumbNail?: string
  fields?: Field[] | []
  footer?: Footer
  countDown?: number
  player?: Player
  winByTimeout?: boolean
  files?: Attachment[]
  board?: string
}

export type Field = {
  name: string
  value: string | ''
}

type Footer = {
  text: string
  iconUrl?: string
}

/*
 * Game logic types
 */
export enum GameTypes {
  OneVsNpc = 'OneVsNpc',
  OneVsOne = 'OneVsOne',
  FourVsNpc = 'FourVsNpc',
}

export interface Settings {
  [key: string]: ChannelSettings
}

export interface ChannelSettings {
  maxAssets: number
  minCapacity: number
  maxCapacity: number
  channelId: string
  gameType: GameTypes
  turnRate: number
  token: {
    awardOnWin: number
  }
}

export interface WinIndexes {
  roll: number
  round: number
}

export interface GameRoundState {
  rollIndex: number
  roundIndex: number
  playerIndex: number
  currentPlayer?: Player
}
