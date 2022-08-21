import Game from '../models/game'
import Player from '../models/player'
import { asyncForEach, wait } from '../utils/shared'
import { Round } from '../models/player'
import settings from '../settings'

export default async function runGame(game: Game, test: boolean) {
  const { rollInterval } = settings[game.channelId]
  try {
    game.rounds = 0
    const playerArr = Object.values(game.players)
    let roundNumber = 1

    while (!game.win) {
      // loop through each player
      await asyncForEach(playerArr, async (player: Player) => {
        // roll six-sided die
        const { damage, numberRolled } = rollDice()
        // increment score
        player.totalScore += damage
        // determine if isWin
        if (player.totalScore === 21) {
          game.winnerDiscordId = player.discordId
          game.win = true
        }
        // if over 21
        if (player.totalScore > 21) {
          player.totalScore = 15
        }
        // add new playerRound to
        const playerRound = new Round(damage, roundNumber, numberRolled, false)
        player.rounds.push(playerRound)

        // perform non-test behaviour
        if (!test) {
          await wait(rollInterval)
          await mutateEmbed()
        }
      })

      roundNumber++
    }
    game.rounds = roundNumber
    game.active = false
  } catch (error) {
    console.log(error)
  }
}

const diceValues: { [key: number]: number } = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
}

export const rollDice = (): { damage: number; numberRolled: number } => {
  const ref = Math.floor(Math.random() * 6) + 1
  return {
    damage: diceValues[ref],
    numberRolled: ref,
  }
}

const mutateEmbed = async () => {
  // update embed
}
