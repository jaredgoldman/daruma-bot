import Game from '../models/game'
import Player from '../models/player'
import { WinIndexes } from '../types/game'

export const checkIfRegisteredPlayer = (
  games: { [key: string]: Game },
  assetId: string,
  discordId: string
) => {
  let gameCount = 0
  const gameArray = Object.values(games)
  gameArray.forEach((game: Game) => {
    const player = game.getPlayer(discordId)
    if (player?.asset.id === Number(assetId)) gameCount++
  })
  return gameCount >= 1
}

/**
 * Returns the win roll and round index of the first player to reach it in game
 * @param players
 * @returns
 */
export const getWinIndexes = (players: Player[]): WinIndexes => {
  const winIndexes = players.reduce(
    ({ roll, round }, player) => {
      const { gameWinRollIndex, gameWinRoundIndex } = player.getRoundsData()

      // if round is highter replace
      if (gameWinRoundIndex > round) {
        return { roll: gameWinRollIndex, round: gameWinRoundIndex }
      }
      if (gameWinRoundIndex === round && gameWinRollIndex > roll) {
        return { roll: gameWinRollIndex, round: gameWinRoundIndex }
      }
      return { roll, round }
    },
    { roll: 0, round: 0 }
  )
  return winIndexes
}
