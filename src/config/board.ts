class BoardConfig {
  private cellWidth: number
  private roundPadding: number
  private numOfRoundsVisible: number
  private turnsInRound: number
  private emojiPadding: number

  constructor(
    cellWidth: number,
    roundPadding: number,
    numberOfRoundsVisible: number,
    turnsInRound: number,
    emojiPadding: number
  ) {
    this.cellWidth = cellWidth
    this.roundPadding = roundPadding
    this.numOfRoundsVisible = numberOfRoundsVisible
    this.turnsInRound = turnsInRound
    this.emojiPadding = emojiPadding
  }

  getRoundWidth() {
    return this.cellWidth * this.turnsInRound
  }

  getSettings() {
    return {
      roundWidth: this.getRoundWidth(),
      cellWidth: this.cellWidth,
      roundPadding: this.roundPadding,
      numOfRoundsVisible: this.numOfRoundsVisible,
      emojiPadding: this.emojiPadding,
    }
  }
}

export default new BoardConfig(5, 5, 2, 3, 2)
