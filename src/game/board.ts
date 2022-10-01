import { RollData, PlayerRoundsData, RoundData } from '../types/attack'
import Player from '../models/player'
import { Alignment, createCell, createWhitespace } from '../utils/boardUtils'
import boardConfig from '../config/board'
import { emojis } from '..'

// import in avsolute values for board sizing
const {
  roundWidth,
  cellWidth,
  roundPadding,
  numOfRoundsVisible,
  emojiPadding,
} = boardConfig.getSettings()

let boardWidth = 0

/**
 * Main round embed building function
 * @param rollIndex
 * @param roundNumber
 * @param playerIndex
 * @param players
 * @returns {string}
 */
export const renderBoard = (
  rollIndex: number,
  roundIndex: number,
  playerIndex: number,
  players: Player[]
): string => {
  const roundRightColumn = createWhitespace(3) + '**ROUND**'
  // create a row representing the current round
  const roundNumberRow = createRoundNumberRow(roundIndex, 2) + roundRightColumn
  // utilize round Number row length
  boardWidth = roundNumberRow.length

  // create a row displaying attack numbers for each player
  // as well as a row displaying the total
  const attackAndTotalRows = createAttackAndTotalRows(
    players,
    playerIndex,
    rollIndex,
    roundIndex
  )

  const board = roundNumberRow + '\n' + attackAndTotalRows

  return board
}

/**
 * Creates row which takes into account the current and potnetially previous row
 * @param roundNumber
 * @param roundsOnEmbed
 * @param isFirstRound
 * @returns {string}
 */
export const createRoundNumberRow = (
  roundIndex: number,
  roundsOnEmbed: number
) => {
  const isFirstRound = roundIndex === 0
  const roundNumber = roundIndex + 1
  let roundNumberRowLabel = ''
  // for each row
  for (let i = 0; i <= roundsOnEmbed - 1; i++) {
    // TODO, make this dynamic
    // if first round, only the first element should have a label
    if (isFirstRound && i === 1) {
      roundNumberRowLabel += createRoundCell()
    } else if (!isFirstRound && i === 0) {
      // as long as we're not in the first round, the first round features
      // the previous round number
      roundNumberRowLabel += createRoundCell(roundNumber - 1)
    } else {
      roundNumberRowLabel += createRoundCell(roundNumber)
    }
    // add round padding
    if (i === 0) {
      roundNumberRowLabel += createWhitespace(roundPadding)
    }
  }
  return roundNumberRowLabel
}

/**
 * Creates single cell with roundNumber
 * @param roundNum
 * @returns {number}
 */
export const createRoundCell = (roundNum?: number): string => {
  let cell = ''
  if (roundNum) {
    let stringNum = roundNum.toString()
    // if shorter than 2 digits prepend a 0
    cell += createCell(roundWidth, Alignment.centered, stringNum, false, '-')
  } else {
    cell = createWhitespace(roundWidth, '-')
  }
  // returb hjust space if no round number
  if (roundNum === 0) {
    cell += createWhitespace(roundPadding)
  }
  return cell
}

/**
 * Creates an attack and total damage roll for each player in the game
 * @param players
 * @param playerIndex
 * @param rollIndex
 * @param roundNumber
 * @param isFirstRound
 * @returns {string}
 */
export const createAttackAndTotalRows = (
  players: Player[],
  playerIndex: number,
  rollIndex: number,
  roundIndex: number
) => {
  let rows = ``
  // For each player
  players.forEach((player: Player, index: number) => {
    const { rounds } = player.getRoundsData()

    // check if it is or has been players turn yet to determine if we should show the attack roll
    const isTurn = index <= playerIndex

    rows += createAttackRow(rounds, roundIndex, rollIndex, isTurn) + '|' + '\n'

    const totalRightColumn = createWhitespace(3) + '**Hits**'
    // add round total row
    rows +=
      createTotalRow(roundIndex, rollIndex, rounds, isTurn) +
      totalRightColumn +
      '\n'
  })

  return rows
}

/**
 * Create a row of attacks with blank spaces factored in
 * Currnetly only works for 2 rounds
 * @param playerRolls
 * @returns {string}
 */
export const createAttackRow = (
  playerRounds: RoundData[],
  roundIndex: number,
  rollIndex: number,
  isTurn: boolean
) => {
  // let row = createWhitespace(emojiPadding)
  let row = ''
  // grab the previous round
  const prevRound = playerRounds[roundIndex - 1]
  // grab the current round
  const currentRound = playerRounds[roundIndex]

  // add previous round to string
  if (prevRound) {
    prevRound.rolls?.forEach((roll: RollData) => {
      if (roll.damage) {
        row += createCell(
          cellWidth,
          Alignment.centered,
          emojis[roll.damage],
          true
        )
      }
    })
    // add whitespace
    // TODO, make this dynamic
    row += createWhitespace(4)
  }
  // add current round to string
  currentRound?.rolls?.forEach((roll: RollData, index: number) => {
    if (roll.damage) {
      if ((isTurn && index === rollIndex) || index < rollIndex) {
        // if it's our turn or has been our turn, add latest roll
        row += createCell(
          cellWidth,
          Alignment.centered,
          emojis[roll.damage],
          true
        )
      }
    }
  })
  return row
}

// /**
//  * Creates single cell with attack number
//  * @param attackNumber
//  * @returns {string}
//  */
// export const createAttackCell = (attackNumber?: number) => {
//   if (!attackNumber) {
//     return createWhitespace(cellWidth)
//   }
//   return createCell(cellWidth, Alignment.left, attackNumber.toString(), '-')
// }

/**
 * Creates a row of total damage for each round
 * @param roundIndex
 * @param rollIndex
 * @param rounds
 * @param isTurn
 * @returns
 */
export const createTotalRow = (
  roundIndex: number,
  rollIndex: number,
  rounds: RoundData[],
  isTurn: boolean
) => {
  const isFirstRound = roundIndex === 0
  let totalRowLabel = ''
  // for each row
  for (let i = 0; i <= numOfRoundsVisible - 1; i++) {
    // previous total is static as round has been completed
    const prevRoundTotal = rounds[roundIndex - 1]?.totalDamageSoFar
    // current total is dynamic as round is still in progress and it may not be time to
    // render the players score yet
    const currRoundRollIndex = isTurn ? rollIndex : rollIndex - 1
    const currRoundTotal =
      rounds[roundIndex]?.rolls[currRoundRollIndex]?.totalScore
    // TODO, make this dynamic
    // if first round, only the first element should have a label
    if (isFirstRound && i === 1) {
      totalRowLabel += createRoundCell()
    } else if (!isFirstRound && i === 0) {
      // as long as we're not in the first round, the first round is previous
      totalRowLabel += createRoundCell(prevRoundTotal)
    } else {
      totalRowLabel += createRoundCell(currRoundTotal)
    }
    // add round padding
    if (i === 0) {
      totalRowLabel += createWhitespace(roundPadding)
    }
  }
  return totalRowLabel
}

/**
 * Calculate current total for any round
 * @param rolls
 * @param roundNumber
 * @returns {string}
 */
export const findRoundTotal = (rolls: RollData[]): number => {
  const roundTotal = rolls.reduce(
    (prevTotal: number, currentRoll: RollData) => {
      const currentRollValue = currentRoll.damage || 0
      return prevTotal + currentRollValue
    },
    0
  )
  return roundTotal
}
