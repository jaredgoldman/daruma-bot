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
  rawEmbed?: boolean
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
  OneVsOne = 'OneVSOne',
  FourVsNpc = 'FourVsNpc',
}

export interface Settings {
  [key: string]: ChannelSettings
}

export interface ChannelSettings {
  maxAssets: number
  minCapacity: number
  maxCapacity: number
  npcHp: number
  rollInterval: number
  channelId: string
  gameType: GameTypes
}
