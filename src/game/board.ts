import { RollData } from '../types/attack'
import Player from '../models/player'
import { Alignment, createCell, createWhitespace } from '../utils/board'
import { boardConfig } from '../config/board'

const { roundWidth, cellWidth, centeredLength } = boardConfig.board
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
  roundNumber: number,
  playerIndex: number,
  players: Player[]
) => {
  const isFirstRound = roundNumber === 1
  // Round number row
  const roundNumberRow = createRoundNumberRow(roundNumber, 2, isFirstRound)
  // TODO determine if we should update score yet for individual player we're on

  // create a row for each player
  const attackRows = createAttackAndTotalRows(
    players,
    playerIndex,
    rollIndex,
    roundNumber
  )

  return roundNumberRow + '\n' + attackRows
}

/**
 * Creates row which takes into account the current and potnetially previous row
 * @param roundNumber
 * @param roundsOnEmbed
 * @param isFirstRound
 * @returns {string}
 */
export const createRoundNumberRow = (
  roundNumber: number,
  roundsOnEmbed: number,
  isFirstRound?: boolean
) => {
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
  roundNumber: number
) => {
  let rows = ``
  const isFirstRound = roundNumber === 1
  // For each player
  for (let i = 0; i <= players.length - 1; i++) {
    // figure out which players should roll this render
    // TODO: does this work?
    // const shouldIncrementRound = i <= playerIndex
    // define which rolls have occured
    const playerRollsSoFar = players[i].getRollsUntilIndex(rollIndex)

    // add attack row
    rows += createAttackRow(playerRollsSoFar) + '\n'
    // add round total row
    rows += createTotalRow(roundNumber, playerRollsSoFar) + '\n'
  }

  return rows
}

/**
 * Create a row of attacks with blank spaces factored in
 * @param playerRolls
 * @returns {string}
 */
export const createAttackRow = (playerRolls: RollData[]) => {
  let row = ``
  // add name
  const lastSixAttacks: RollData[] = playerRolls.slice(-6)
  const lastSixAttacksLength = lastSixAttacks.length

  if (lastSixAttacksLength < 6) {
    const blankSpaces = 6 - lastSixAttacksLength
    for (let i = 1; i <= blankSpaces; i++) {
      lastSixAttacks.push({ roll: undefined, damage: undefined })
    }
  }
  // add attack data/
  lastSixAttacks.forEach((attack) => {
    if (attack?.damage) {
      row += createAttackCell(attack.damage)
    } else {
      row += createAttackCell()
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
  const attackNumberString = attackNumber.toString()
  // if (attackNumberString.length < 2) {
  //   return createCell(cellWidth, Alignment.centered, `0${attackNumberString}`)
  // }
  return createCell(cellWidth, Alignment.left, attackNumberString)
}

/**
 * Creates row of round total scores
 * @param roundNumber
 * @param rolls
 * @param isFirstRound
 * @returns
 */
export const createTotalRow = (
  roundNumber: number,
  rolls: RollData[]
): string => {
  if (roundNumber === 1) {
    const firstRoundTotal = findRoundTotal(rolls).toString()
    return createCell(centeredLength, Alignment.centered, firstRoundTotal)
  }
  const prevRoundTotal = findRoundTotal(rolls).toString()
  const currRoundTotal = findRoundTotal(rolls).toString()
  const prevRoundCell = createCell(
    centeredLength,
    Alignment.centered,
    prevRoundTotal
  )
  const currRoundCell = createCell(
    centeredLength,
    Alignment.centered,
    currRoundTotal
  )
  return prevRoundCell + currRoundCell
}

/**
 * Calculate current total for any round
 * @param rolls
 * @param roundNumber
 * @returns {string}
 */
export const findRoundTotal = (
  rolls: RollData[],
  roundNumber: number = 1
): number => {
  // TODO: grab last 3 rounds from round number
  const roundTotal = rolls.reduce(
    (prevTotal: number, currentRoll: RollData) => {
      const currentRollValue = currentRoll.damage || 0
      return prevTotal + currentRollValue
    },
    0
  )
  return roundTotal
}

// BOARD VISUALIZATION AND MEASUERMENTS
// w: 25
// h: 1 = 2 X playerCount
// first column width: 13
// round width: 11 OR 13 w/ padding

/*           ----5-----6
-------------------25------------------
-----13------     1              2            -> roundNumberRow
Algorandpa   X     X     X    X    X    X       -> attackRow
hits:             6              12           -> totalRow
wpatest      X    X    X    X    X    X 
hits:             6              12    
----------------------------------------
             -----15--------    
*/
