import { RollData, PlayerRoundsData, RoundData } from '../types/attack'
import Player from '../models/player'
import { Alignment, createCell, createWhitespace } from '../utils/boardUtils'
import boardConfig from '../config/board'

// import in avsolute values for board sizing
const {
  roundWidth,
  cellWidth,
  roundPadding,
  numOfRoundsVisible,
  leftColumnWidth,
} = boardConfig.getSettings()

const leftColumnCell = createCell(leftColumnWidth, Alignment.left, '-')

const addLeftColumnCell = (content: string) => leftColumnCell + content

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
  // Round number row
  const roundNumberRow = addLeftColumnCell(createRoundNumberRow(roundIndex, 2))

  // create a row for each player
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
    if (isFirstRound && i === 0) {
      roundNumberRowLabel += createRoundCell()
    } else if (!isFirstRound && i === 0) {
      // as long as we're not in the first round, the first round is previous
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
  if (roundNum) {
    let stringNum = roundNum.toString()
    // if shorter than 2 digits prepend a 0
    if (roundNum < 10) {
      return createCell(roundWidth, Alignment.centered, `0${stringNum}`)
    } else {
      return createCell(roundWidth, Alignment.centered, stringNum)
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
    const { rounds } = player.getRoundsData()

    // check if it is or has been players turn yet to determine if we should show the attack roll
    const isTurn = index <= playerIndex

    rows +=
      addLeftColumnCell(
        createAttackRow(rounds, roundIndex, rollIndex, isTurn)
      ) + '\n'
    // add round total row
    rows +=
      addLeftColumnCell(createTotalRow(roundIndex, rollIndex, rounds)) + '\n'
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
  rollIndex: number,
  isTurn: boolean
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
  // add current round to string
  currentRound.rolls.forEach((roll: RollData, index: number) => {
    // if our current player index is higher than the playerindex passed, don't show the latest roll
    if ((isTurn && index === rollIndex) || index < rollIndex) {
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

export const createTotalRow = (
  roundIndex: number,
  rollIndex: number,
  rounds: RoundData[]
) => {
  const isFirstRound = roundIndex === 0
  let totalRowLabel = ''
  // for each row
  for (let i = 0; i <= numOfRoundsVisible - 1; i++) {
    const prevRoundTotal = rounds[roundIndex - 1]?.totalDamageSoFar
    const currRoundTotal = rounds[roundIndex].rolls[rollIndex]?.totalScore
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
