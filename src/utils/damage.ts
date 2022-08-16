const diceValue: {[key: number]: number} = {
  1:1, 2:1, 3:2, 4:2, 5:3, 6:3
}

export const rollDice = (): number => {
  const ref = Math.floor(Math.random() * 6) + 1
  return diceValue[ref]
}