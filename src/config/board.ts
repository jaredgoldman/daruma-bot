class BoardConfig {
  private cellWidth: number
  private roundPadding: number
  private numOfRoundsVisible: number
  private turnsInRound: number
  private emojiPadding: number
  private attackRoundPadding: number

  constructor(
    cellWidth: number,
    roundPadding: number,
    numberOfRoundsVisible: number,
    turnsInRound: number,
    emojiPadding: number,
    attackRoundPadding: number
  ) {
    this.cellWidth = cellWidth
    this.roundPadding = roundPadding
    this.numOfRoundsVisible = numberOfRoundsVisible
    this.turnsInRound = turnsInRound
    this.emojiPadding = emojiPadding
    this.attackRoundPadding = attackRoundPadding
  }

  getRoundWidth(): number {
    return this.cellWidth * this.turnsInRound + this.roundPadding
  }

  getSettings() {
    return {
      roundWidth: this.getRoundWidth(),
      cellWidth: this.cellWidth,
      roundPadding: this.roundPadding,
      numOfRoundsVisible: this.numOfRoundsVisible,
      emojiPadding: this.emojiPadding,
      turnsInRound: this.turnsInRound,
      attackRoundPadding: this.attackRoundPadding,
    }
  }
}

// TODO: fetch this from db
export default new BoardConfig(4, 3, 2, 3, 2, 5)
