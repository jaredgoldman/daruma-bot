import Game from '../models/game'
import Player, { Players, Round } from '../models/player'
import { asyncForEach, wait } from '../utils/shared'
import { Roll } from '../models/player'
import settings from '../settings'
import { players, settings as testSettings } from '../mocks/game'

export default async function runGame(game: Game, test: boolean) {
  const { rollInterval } = test ? testSettings : settings[game.channelId]

  try {
    const playerArr = Object.values(game.players)
    game.rolls = 1

    while (!game.win) {
      // loop through each player
      await asyncForEach(playerArr, async (player: Player) => {
        const currentRoundNumber = game.roundNumber
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
        // add new playerRoll to
        const roll: Roll = {
          damage,
          roundNumber: game.roundNumber || 1,
          numberRolled,
          isWin: game.win,
        }

        const currentRound = player.rounds[currentRoundNumber]
        // Create round array with first roll or push new roll into existing array
        // Also update totalDamage
        if (!currentRound) {
          player.rounds[currentRoundNumber] = {
            rolls: [roll],
            totalDamage: damage,
          }
        } else {
          currentRound.rolls.push(roll)
          currentRound.totalDamage += damage
        }

        // perform non-test behaviour
        if (!test) {
          await wait(rollInterval)
        }
      })
      mutateEmbed(players, game.roundNumber)
      // if we're on the third roll, update rounds
      if (game.rolls % 3 === 0) game.roundNumber++
      game.rolls++
    }
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

const mutateEmbed = (players: Players, roundNumber: number): string => {
  const playerArr = Object.values(players)

  let board = '-'.repeat(10) + '\n'
  // FOR EACH PLAYER
  playerArr.forEach((player) => {
    board += createPlayerRow(player, roundNumber) + '\n'
  })
  board = board += '-'.repeat(10) + '\n'
  console.log(board)
  return board
}

const createPlayerRow = (player: Player, roundNumber: number) => {
  const { rounds } = player
  const isFirstRound = roundNumber === 1
  const prevRoundNumber = roundNumber - 1
  const currentRound = rounds[roundNumber]
  const prevRound = rounds[prevRoundNumber]

  const firstRow = isFirstRound
    ? `round 1`
    : `round: ${prevRoundNumber}    round: ${roundNumber}`

  let secondRow = ''
  if (!isFirstRound) {
    secondRow += mapRoundsForSecondRow(prevRound)
  }

  secondRow += mapRoundsForSecondRow(currentRound)

  const thirdRow = isFirstRound
    ? `      ${currentRound.totalDamage}`
    : `      ${prevRound.totalDamage}           ${currentRound.totalDamage}`
  return firstRow + '\n' + '| ' + secondRow + '\n' + thirdRow
}

const mapRoundsForSecondRow = (round: Round) => {
  const { rolls } = round
  return `${rolls[0]?.damage || ' '} - ${rolls[1]?.damage || ' '} - ${
    rolls[2]?.damage || ' '
  } | `
}
