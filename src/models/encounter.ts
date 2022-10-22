import { PlayerRoundsData } from '../types/attack'
import { GameRoundState } from '../types/game'
import Player from './player'

/**
 * A class representing a game round
 */
export default class Encounter {
  constructor(
    public winningPlayers: Player[],
    public gameType: string,
    public startTime: number,
    public endTime: number,
    public rounds: number,
    public playerRoundState: { [key: string]: PlayerRoundsData },
    public endOfGameRoundState: GameRoundState,
    public channelId: string
  ) {}
}
