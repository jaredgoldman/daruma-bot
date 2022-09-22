import { RollData, PlayerRoundsData, RoundData } from '../types/attack'
import Player from '../models/player'
import { Alignment, createCell, createWhitespace } from '../utils/boardUtils'
import { boardConfig } from '../config/board'

// import in avsolute values for board sizing
const { roundWidth, cellWidth, roundPadding } = boardConfig.board
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
) => {
  try {
    // Round number row
    const roundNumberRow = createRoundNumberRow(roundIndex, 2)
    // TODO determine if we should update score yet for individual player we're on

    // create a row for each player
    const attackAndTotalRows = createAttackAndTotalRows(
      players,
      playerIndex,
      rollIndex,
      roundIndex
    )

    const board = roundNumberRow + '\n' + attackAndTotalRows

    return board
  } catch (error) {
    console.log('****** ERROR RENDERING BOARD ******', error)
  }
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
  roundsOnEmbed: number,
  isFirstRound?: boolean
) => {
  const roundNumber = roundIndex + 1
  let roundNumberRowLabel = ``
  for (let i = 1; i <= roundsOnEmbed; i++) {
    // TODO, make this dynamic
    // if first round, only the first element should have a label
    if (isFirstRound && i === 2) {
      roundNumberRowLabel += createRoundCell()
    } else if (i === 1 && roundNumber !== 1) {
      // as long as we're not in the first round, the first round is previous
      roundNumberRowLabel += createRoundCell(roundNumber - 1)
    } else {
      roundNumberRowLabel += createRoundCell(roundNumber)
    }
    // add round padding
    if (i === 1) {
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
  if (roundNum) {
    let stringNum = roundNum.toString()
    // if shorter than 2 digits prepend a 0
    if (roundNum < 10) {
      return createCell(roundWidth, Alignment.centered, `0${stringNum}`, 1)
    } else {
      return createCell(roundWidth, Alignment.centered, stringNum, 1)
    }
  }
  // returb hjust space if no round number
  return createWhitespace(roundWidth)
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
    // check if win
    const { gameWinRoundIndex, rounds } = player.getRoundsData()
    // if (gameWinRoundIndex) {
    //   player.setIsWinner()
    // }
    // const shouldIncrementRound = index <= playerIndex
    rows += createAttackRow(rounds, roundIndex, rollIndex) + '\n'
    // add round total row
    rows += createTotalRow(rounds, roundIndex, rollIndex) + '\n'
  })

  return rows
}

/**
 * Create a row of attacks with blank spaces factored in
 * @param playerRolls
 * @returns {string}
 */
export const createAttackRow = (
  playerRounds: RoundData[],
  roundIndex: number,
  rollIndex: number
) => {
  let row = ``
  // grab the previous round
  const prevRound = playerRounds[roundIndex - 1]
  // grab the current round
  const currentRound = playerRounds[roundIndex]

  // add previous round tp string
  if (prevRound) {
    prevRound.rolls.forEach((roll: RollData) => {
      row += createCell(cellWidth, Alignment.centered, roll.damage?.toString())
    })
    // add whitespace
    row += createWhitespace(roundPadding)
  }

  currentRound.rolls.forEach((roll: RollData, index: number) => {
    if (index <= rollIndex) {
      row += createCell(cellWidth, Alignment.centered, roll.damage?.toString())
    } else {
      row += createWhitespace(cellWidth)
    }
  })
  return row
}

/**
 * Creates single cell with attack number
 * @param attackNumber
 * @returns {string}
 */
export const createAttackCell = (attackNumber?: number) => {
  if (!attackNumber) {
    return createWhitespace(cellWidth)
  }
  return createCell(cellWidth, Alignment.left, attackNumber.toString())
}

/**
 * Creates row of round total scores
 * @param roundNumber
 * @param rolls
 * @param isFirstRound
 * @returns
 */
export const createTotalRow = (
  rounds: RoundData[],
  roundIndex: number,
  rollIndex: number
): string => {
  // static round total
  const prevRoundTotal = rounds[roundIndex - 1]?.totalDamageSoFar.toString()
  // dynamic round total
  const currRoundTotal =
    rounds[roundIndex].rolls[rollIndex]?.totalScore.toString() || ''

  if (roundIndex === 0) {
    return createCell(roundWidth, Alignment.centered, currRoundTotal, 2)
  }

  // Create round total cells
  const prevRoundCell = createCell(
    roundWidth,
    Alignment.centered,
    prevRoundTotal,
    2
  )
  const currRoundCell = createCell(
    roundWidth,
    Alignment.centered,
    currRoundTotal,
    2
  )
  return prevRoundCell + createWhitespace(roundPadding) + currRoundCell
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
