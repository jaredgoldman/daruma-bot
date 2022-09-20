import { RollData } from '../types/attack'
import Player from '../models/player'

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
    roundNumber,
    isFirstRound
  )

  return roundNumberRow + '\n' + attackRows
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
  roundNumber: number,
  isFirstRound: boolean
) => {
  let rows = ``
  for (let i = 0; i <= players.length - 1; i++) {
    const shouldIncrementRound = i <= playerIndex

    const playerRollsSoFar = players[i].getRollsUntilIndex(rollIndex)

    if (shouldIncrementRound) {
      // create row with latest score
      rows += 'attacks: ' + createAttackRow(playerRollsSoFar) + '\n'
    } else {
      // figure out how to not increment latest score on this row
      rows += 'attacks: ' + createAttackRow(playerRollsSoFar) + '\n'
    }
    // add total row here
    rows +=
      'total: ' +
      createTotalRow(roundNumber, playerRollsSoFar, isFirstRound) +
      '\n'
  }

  return rows
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
  rolls: RollData[],
  isFirstRound: boolean
): string => {
  if (isFirstRound) {
    return createRoundTotal(rolls, 1)
  }
  const prevRoundTotal = createRoundTotal(rolls, roundNumber - 1)
  const currRoundTotal = createRoundTotal(rolls, roundNumber)
  return `${prevRoundTotal}             ${currRoundTotal}`
}

/**
 * Calculate current total for any round
 * @param rolls
 * @param roundNumber
 * @returns {string}
 */
export const createRoundTotal = (
  rolls: RollData[],
  roundNumber: number
): string => {
  const roundStartIndex = roundNumber * 3 - 1
  const roundEndIndex = roundStartIndex + 3
  const roundRolls = rolls.slice(roundStartIndex, roundEndIndex)

  const roundTotal = roundRolls.reduce(
    (prevTotal: number, currentRoll: RollData) => {
      const currentRollValue = currentRoll.damage || 0
      return prevTotal + currentRollValue
    },
    0
  )
  return roundTotal.toString()
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
    return `     `
  }
  const attackNumberString = attackNumber.toString()
  if (attackNumberString.length < 2) {
    return `${attackNumber}    `
  }
  return `${attackNumber}   `
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

    // if first round, only the first element should have it
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
export const createRoundCell = (roundNum?: number) => {
  if (roundNum) {
    let stringNum = roundNum.toString()
    if (stringNum.length < 10) return `     0${stringNum}    `
    return `     ${stringNum}     `
  }

  return `           `
}

// BOARD VISUALIZATION AND MEASUERMENTS
// w: 25
// h: 1 = 2 X playerCount
// first column width: 13
// round width: 11 OR 13 w/ padding

/*           ----5-----6
-------------------25------------------
-----13------     1              2            -> roundNumberRow
Algorandpa   X    X    X    X    X    X       -> attackRow
hits:             6              12           -> totalRow
wpatest      X    X    X    X    X    X 
hits:             6              12    
----------------------------------------
             -----15--------    
*/
