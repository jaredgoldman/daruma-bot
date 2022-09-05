export default class NPC {
  constructor(public hp: number) {
    this.dead = false
  }

  private dead: boolean
  isDead() {
    return this.dead
  }
  setDead() {
    this.dead = true
  }
}
