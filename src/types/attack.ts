export interface RollData {
  roll: number | undefined
  damage: number | undefined
  totalScore: number
}

export interface RoundData {
  roundNumber: number
  totalDamageSoFar: number
  rolls: Array<RollData>
}

export interface PlayerRoundsData {
  rounds: RoundData[]
  gameWinRoundIndex: number
  gameWinRollIndex: number
}
