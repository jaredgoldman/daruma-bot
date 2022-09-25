class BoardConfig {
  private cellWidth: number
  private roundPadding: number
  private numOfRoundsVisible: number
  private turnsInRound: number
  private leftColumnWidth: number

  constructor(
    cellWidth: number,
    roundPadding: number,
    numberOfRoundsVisible: number,
    turnsInRound: number,
    leftColumnWidth: number
  ) {
    this.cellWidth = cellWidth
    this.roundPadding = roundPadding
    this.numOfRoundsVisible = numberOfRoundsVisible
    this.turnsInRound = turnsInRound
    this.leftColumnWidth = leftColumnWidth
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
      leftColumnWidth: this.leftColumnWidth,
    }
  }
}

export default new BoardConfig(8, 3, 2, 3, 3)
