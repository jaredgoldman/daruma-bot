import Game from '../models/game'
import Player from '../models/player'
import { asyncForEach } from '../utils/helpers'

export default async function runGame(game: Game) {
  const playerArr = Object.values(game.players)

  // loop through each player in the game taking turns rolling
  await asyncForEach(playerArr, async (player: Player) => {
    // three times to damage the NPC
    for (let i = 1; i <= 3; i++) {}
  })
  // handle 21 rules logic in seperate tested function
}
