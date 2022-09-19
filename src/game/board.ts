import { RollData } from '../types/attack'
import Player from '../models/player'

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
  const attackRows = createAttackRows(players, playerIndex, rollIndex)
  console.log(attackRows)

  return roundNumberRow + '\n' + attackRows
}

export const createAttackRows = (
  players: Player[],
  playerIndex: number,
  rollIndex: number
) => {
  let rows = ``
  for (let i = 0; i <= players.length - 1; i++) {
    const shouldIncrementRound = i <= playerIndex

    const playerRollSoFar = players[i].getRollsUntilIndex(rollIndex)

    if (shouldIncrementRound) {
      // create row with latest score
      rows += createAttackRow(playerRollSoFar) + '\n'
    } else {
      // figure out how to not increment latest score on this row
      rows += createAttackRow(playerRollSoFar) + '\n'
    }
  }

  return rows
}

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

export const createRoundCell = (roundNum?: number) => {
  if (roundNum) {
    let stringNum = roundNum.toString()
    if (stringNum.length < 10) return `     0${stringNum}    `
    return `     ${stringNum}     `
  }

  return `           `
}

/*           ----5-----6
-------------------25------------------
-----13------     1              2            -> roundNumberRow
Algorandpa   X    X    X    X    X    X       -> attackRow
hits:             6              12           -> hitRow
wpatest      X    X    X    X    X    X 
hits:             6              12    
----------------------------------------
             -----15--------    
*/
