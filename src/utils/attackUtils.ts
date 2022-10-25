import { PlayerRoundsData, RollData } from '../types/attack'
import { randomNumber } from './sharedUtils'

export class PlayerDice {
  private static readonly diceValues: { [key: number]: number } = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
  }

  /**
   * Takes a dice roll from 1 to 6 and adds it to an array.
   *
   * @private
   * @param {number} arrayLength length of array
   * @memberof PlayerDice
   * @returns {Array<number>} Array<number>
   */
  private static diceRollsArr = (arrayLength: number): Array<number> =>
    Array.from({ length: arrayLength }, () => randomNumber(1, 6))

  /**
   * Takes an array of rolls from diceRollsArr and maps damage to it
   *
   * @private
   * @param {Array<number>} diceRolls Array of numbers from diceRollsArr
   * @memberof PlayerDice
   * @returns PlayerRoundsData
   */
  private static damageCalc = (diceRolls: Array<number>): PlayerRoundsData => {
    // set up variables
    let totalScore = 0
    let rollIndex = 0
    let roundIndex = 0
    let isWin = false

    // temp storage for round rolls
    let roundRolls: Array<RollData> = []
    // set up return value
    const roundsData: PlayerRoundsData = {
      rounds: [],
      gameWinRollIndex: 0,
      gameWinRoundIndex: 0,
    }

    for (let index = 0; index < diceRolls.length; index++) {
      const roll = diceRolls[index]
      // grab damage value
      const damage = PlayerDice.diceValues[roll]
      // iterate total score
      totalScore += damage

      // reset total score to 15 if over 21
      if (totalScore > 21 && roundsData.gameWinRoundIndex === 0) {
        totalScore = 15
      }

      // set game index if win
      if (totalScore === 21) {
        roundsData.gameWinRoundIndex = roundIndex
        roundsData.gameWinRollIndex = rollIndex
        isWin = true
      }

      // push new roll to round rolls
      roundRolls.push({ damage, roll, totalScore })

      // if we're starting a new round, push the round to roundsData
      // clear roundRolls, increment roundIndex, reset rollIndex
      // push last rolls in if it's a winning roll
      if (rollIndex === 2 || isWin) {
        const roundData = {
          roundNumber: roundIndex + 1,
          totalDamageSoFar: totalScore,
          rolls: roundRolls,
        }

        roundsData.rounds.push(roundData)
        roundRolls = []
        roundIndex++
        rollIndex = 0
      } else {
        rollIndex++
      }
      // stop loop if win, else increment rollIndex
      if (isWin) {
        break
      }
    }
    return roundsData
  }

  public static completeGameForPlayer = (): PlayerRoundsData => {
    return PlayerDice.damageCalc(PlayerDice.diceRollsArr(100))
  }
}
