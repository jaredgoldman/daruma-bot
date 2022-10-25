import Player from '../models/player'

/*
 * Game logic types
 */
export enum GameTypes {
  OneVsNpc = 'OneVsNpc',
  OneVsOne = 'OneVsOne',
  FourVsNpc = 'FourVsNpc',
}

export interface ChannelSettings {
  maxAssets: number
  minCapacity: number
  maxCapacity: number
  channelId: string
  gameType: GameTypes
  turnRate: number
  coolDown: number
  token: {
    awardOnWin: number
  }
}

export interface GameRoundState {
  rollIndex: number
  roundIndex: number
  playerIndex: number
  currentPlayer?: Player
}
