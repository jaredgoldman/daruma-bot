import Game from '../models/game'

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
