import { ColorResolvable, Attachment } from 'discord.js'
import Player from '../models/player'

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

export enum GameTypes {
  OneVsNpc = 'OneVsNpc',
  OneVsOne = 'OneVSOne',
  FourVsNpc = 'FourVsNpc',
}
